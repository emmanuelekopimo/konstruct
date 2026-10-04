import { z } from "zod";
import { CITY_NAMES, findCity } from "./locations";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"] as const;

const email = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .email("Enter a valid email address")
  .max(120, "Email is too long");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60, "Name is too long"),
  email,
  password: z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters"),
  city: z.string().refine((c) => CITY_NAMES.includes(c), "Choose a city"),
});

export const citySchema = z.object({
  city: z.string().refine((c) => CITY_NAMES.includes(c), "Choose a city"),
});

export type UploadFile = { name: string; type: string; size: number };

export const uploadSchema = z.object({
  title: z.string().trim().max(80, "Keep the title under 80 characters").optional(),
  city: z.string().refine((c) => CITY_NAMES.includes(c), "Choose the site city"),
  file: z
    .custom<UploadFile>((v) => typeof v === "object" && v !== null && "size" in v, "Choose a plan file")
    .refine((f) => f.size > 0, "Choose a plan file")
    .refine((f) => f.size <= MAX_UPLOAD_BYTES, "The file is larger than 8 MB")
    .refine(
      (f) => (ACCEPTED_TYPES as readonly string[]).includes(f.type),
      "Upload a PDF, PNG, JPG or WEBP file",
    ),
});

// Quantities are free decimals (no step rules); prices are whole Naira.
export const itemEditSchema = z.object({
  quantity: z.coerce
    .number({ message: "Enter a number" })
    .gt(0, "Must be more than 0")
    .max(10_000_000, "That is too large"),
  unitPrice: z
    .union([z.literal(""), z.coerce.number({ message: "Enter a price" }).min(0, "Cannot be negative").max(1_000_000_000, "That is too large")])
    .optional(),
});

export type FieldErrors = Record<string, string>;

/** First message per field, ready for inline display. */
export function fieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function stateOfCity(city: string): string {
  return findCity(city)?.state ?? city;
}
