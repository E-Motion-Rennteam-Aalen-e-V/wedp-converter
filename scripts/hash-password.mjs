#!/usr/bin/env node
// Generates a scrypt "salt:hash" string for ADMIN_PASSWORD_HASH or a
// .admin-users.json entry's passwordHash field.
//
// Usage: node scripts/hash-password.mjs "my-strong-password"

import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log(`${salt}:${hash}`);
