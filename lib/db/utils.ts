// lib/db/utils.ts — NO-DB stub (tanpa bcrypt)
import { generateId } from 'ai';

/** NO-DB: kembalikan string "hash" ringan saja (bukan bcrypt). */
export function generateHashedPassword(password: string) {
  // supaya tidak plain, kasih prefix sederhana (opsional)
  return `stub$${password}`;
}

/** NO-DB: buat dummy password "ter-hash" tanpa bcrypt. */
export function generateDummyPassword() {
  const password = generateId();        // random id dari 'ai'
  const hashedPassword = generateHashedPassword(password);
  return hashedPassword;
}

/** NO-DB: comparator sederhana (kalau ada yang import). */
export async function comparePassword(a: string, b: string) {
  return a === b || a === `stub$${b}`;
}
