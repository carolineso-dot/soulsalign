import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Photo storage abstraction. Code always calls `saveImage` / `deleteImage`;
 * the concrete backend is chosen by STORAGE_DRIVER so production photos live in
 * real object storage (Supabase) while local dev writes to ./public/uploads.
 *
 * IMPORTANT: the local driver is for development only. In production set
 * STORAGE_DRIVER=supabase so images survive deploys (the local filesystem on
 * serverless hosts is ephemeral).
 */

export type SavedImage = { url: string; key: string };

interface StorageAdapter {
  save(buffer: Buffer, contentType: string, ext: string): Promise<SavedImage>;
  remove(key: string): Promise<void>;
}

function randomKey(ext: string): string {
  const rand =
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${rand}.${ext}`;
}

/* ------------------------------ local driver ----------------------------- */

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

const localAdapter: StorageAdapter = {
  async save(buffer, _contentType, ext) {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    const key = randomKey(ext);
    await fs.writeFile(path.join(LOCAL_DIR, key), buffer);
    return { url: `/uploads/${key}`, key };
  },
  async remove(key) {
    try {
      await fs.unlink(path.join(LOCAL_DIR, key));
    } catch {
      // already gone — ignore
    }
  },
};

/* ---------------------------- supabase driver ---------------------------- */

const supabaseAdapter: StorageAdapter = {
  async save(buffer, contentType, ext) {
    const url = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "photos";
    const key = randomKey(ext);

    const res = await fetch(
      `${url}/storage/v1/object/${bucket}/${key}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      },
    );
    if (!res.ok) {
      throw new Error(`Supabase upload failed: ${res.status} ${await res.text()}`);
    }
    return {
      url: `${url}/storage/v1/object/public/${bucket}/${key}`,
      key,
    };
  },
  async remove(key) {
    const url = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "photos";
    await fetch(`${url}/storage/v1/object/${bucket}/${key}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${serviceKey}` },
    });
  },
};

/* -------------------------------- selector ------------------------------- */

function adapter(): StorageAdapter {
  return process.env.STORAGE_DRIVER === "supabase"
    ? supabaseAdapter
    : localAdapter;
}

export async function saveImage(
  buffer: Buffer,
  contentType: string,
): Promise<SavedImage> {
  const ext =
    contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : contentType.includes("gif")
          ? "gif"
          : "jpg";
  return adapter().save(buffer, contentType, ext);
}

export async function deleteImage(key: string): Promise<void> {
  return adapter().remove(key);
}
