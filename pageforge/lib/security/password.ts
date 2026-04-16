// ═══════════════════════════════════════════════════════════════════
// SECURITY LAYER 3: Password hashing with bcryptjs
// Uses bcrypt with 12 rounds of salt. bcryptjs is pure JavaScript —
// no native dependencies, so it works in any environment including
// serverless and edge runtimes.
// ═══════════════════════════════════════════════════════════════════
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch {
    // Malformed hash — treat as failed match, never throw to caller
    return false;
  }
}

/**
 * Constant-time string comparison for comparing tokens / secrets.
 * Prevents timing attacks on equality checks.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
