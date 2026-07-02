/**
 * Derives the PRODUCTION Prisma schema (PostgreSQL) from the local dev schema
 * (SQLite), so the two never drift. Only the datasource provider and the
 * generator's binaryTargets change — every model is copied verbatim.
 *
 * Run after any change to prisma/schema.prisma:  npm run prod:schema
 * (Vercel's build runs this automatically.)
 */

import { promises as fs } from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "prisma", "schema.prisma");
const OUT_DIR = path.join(process.cwd(), "prisma", "prod");
const OUT = path.join(OUT_DIR, "schema.prisma");

const raw = await fs.readFile(SRC, "utf8");

let out = raw
  // sqlite -> postgresql
  .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
  // add Vercel/Linux engine target to the generator
  .replace(
    /generator client \{\s*\n\s*provider\s*=\s*"prisma-client-js"/,
    'generator client {\n  provider      = "prisma-client-js"\n  binaryTargets = ["native", "rhel-openssl-3.0.x"]',
  );

const banner = `// AUTO-GENERATED from prisma/schema.prisma by scripts/gen-prod-schema.mjs.
// Do not edit by hand. Run \`npm run prod:schema\` after changing the dev schema.\n\n`;

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(OUT, banner + out, "utf8");
console.log("Wrote", path.relative(process.cwd(), OUT));
