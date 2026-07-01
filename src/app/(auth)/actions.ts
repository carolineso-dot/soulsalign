"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { autoGrantTestMatches } from "@/app/actions/test";

export type AuthState = { error?: string };

const credsSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credsSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
  await createSession(user.id);
  // Test mode only: no-op in production.
  await autoGrantTestMatches(user.id);
  redirect("/transition");
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credsSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Please check your email and password." };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Those details don't match an account." };
  }

  await createSession(user.id);
  // Test mode only: no-op in production.
  await autoGrantTestMatches(user.id);
  redirect("/transition");
}
