// ═══════════════════════════════════════════════════════════════════
// SECURITY LAYER 1: Input validation with Zod
// Every API input is parsed through a strict schema. Unknown fields
// are stripped, types are coerced, and max lengths are enforced to
// prevent resource exhaustion.
// ═══════════════════════════════════════════════════════════════════
import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be under 128 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

export const generationSchema = z
  .object({
    prompt: z.string().trim().min(10, "Tell us more about your business").max(2000),
    theme: z
      .enum([
        "dark-minimal",
        "electric-indigo",
        "forest-emerald",
        "sunset-coral",
        "bold-monochrome",
        "royal-amber",
        "cyber-neon",
        "warm-cream",
      ])
      .optional(),
    fontPair: z
      .enum(["clash-satoshi", "cabinet-satoshi", "serif-elegant", "geometric-modern", "editorial-bold"])
      .optional(),
    animationLevel: z.enum(["none", "subtle", "dynamic", "bold"]).optional(),
    industry: z.string().trim().max(100).optional(),
  })
  .strict();

export const updatePageSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    htmlContent: z.string().max(500_000).optional(),
    designSystem: z.record(z.string(), z.any()).optional(),
  })
  .strict();

export const publishSchema = z
  .object({
    pageId: z.string().min(1).max(64),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(40)
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Use lowercase letters, numbers, and dashes only")
      .optional(),
  })
  .strict();

/**
 * Safely parse input against a schema. Returns either the validated data
 * or an object describing the first validation error. Never throws.
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0];
  return { ok: false, error: `${first.path.join(".") || "input"}: ${first.message}` };
}
