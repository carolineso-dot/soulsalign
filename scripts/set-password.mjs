/**
 * Admin password reset (beta) — no email infrastructure required.
 *
 *   npm run set-password -- <email> <newPassword>
 *
 * Sets a new bcrypt-hashed password for the account with that email. Share the
 * new password with the member out-of-band (Slack/text) and ask them to keep it
 * private. Reads DATABASE_URL from .env.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: npm run set-password -- <email> <newPassword>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) {
    console.error(`No account found for "${email}".`);
    process.exit(1);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  console.log(
    `✓ Password reset for ${email}. Share it with them privately and ask them to change it via their profile later.`,
  );
} finally {
  await prisma.$disconnect();
}
