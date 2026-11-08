import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const parameters = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const format = /^scrypt:131072:8:1:([a-f0-9]{32}):([a-f0-9]{128})$/;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, parameters, (error, key) => error ? reject(error) : resolve(key)));
}

export function isPasswordHash(value: string): boolean { return format.test(value); }

export async function hashAdminPassword(password: string): Promise<string> {
  if (password.length < 14 || Buffer.byteLength(password) > 1024) throw new Error("Use a password of at least 14 characters and at most 1024 bytes.");
  const salt = randomBytes(16);
  return `scrypt:131072:8:1:${salt.toString("hex")}:${(await derive(password, salt)).toString("hex")}`;
}

export async function verifyAdminPassword(password: string, hash: string): Promise<boolean> {
  const match = hash.match(format);
  if (!match || Buffer.byteLength(password) > 1024) return false;
  const actual = await derive(password, Buffer.from(match[1], "hex"));
  return timingSafeEqual(actual, Buffer.from(match[2], "hex"));
}
