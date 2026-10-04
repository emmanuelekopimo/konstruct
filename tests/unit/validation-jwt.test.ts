import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "@/lib/jwt";
import {
  MAX_UPLOAD_BYTES, fieldErrors, itemEditSchema, signInSchema, signUpSchema, stateOfCity, uploadSchema,
} from "@/lib/validation";

const file = (over: Partial<{ name: string; type: string; size: number }> = {}) => ({
  name: "plan.pdf", type: "application/pdf", size: 1000, ...over,
});

describe("upload validation", () => {
  it("accepts a PDF for a listed city", () => {
    expect(uploadSchema.safeParse({ city: "Enugu", file: file() }).success).toBe(true);
  });
  it("gives one inline message per field", () => {
    const r = uploadSchema.safeParse({ city: "Paris", title: "x".repeat(81), file: file({ type: "text/plain" }) });
    expect(r.success).toBe(false);
    const e = fieldErrors(r.error!);
    expect(e).toEqual({
      city: "Choose the site city",
      title: "Keep the title under 80 characters",
      file: "Upload a PDF, PNG, JPG or WEBP file",
    });
  });
  it("rejects empty and oversized files", () => {
    expect(fieldErrors(uploadSchema.safeParse({ city: "Lagos", file: file({ size: 0 }) }).error!).file).toBe("Choose a plan file");
    expect(fieldErrors(uploadSchema.safeParse({ city: "Lagos", file: file({ size: MAX_UPLOAD_BYTES + 1 }) }).error!).file).toBe("The file is larger than 8 MB");
    expect(fieldErrors(uploadSchema.safeParse({ city: "Lagos" }).error!).file).toBe("Choose a plan file");
  });
});

describe("item edits", () => {
  it("accepts decimal quantities without step rules", () => {
    expect(itemEditSchema.parse({ quantity: "38.37" }).quantity).toBeCloseTo(38.37);
    expect(itemEditSchema.parse({ quantity: "1450", unitPrice: "420000" }).unitPrice).toBe(420000);
    expect(itemEditSchema.parse({ quantity: "1", unitPrice: "" }).unitPrice).toBe("");
  });
  it("rejects zero and negative values", () => {
    expect(fieldErrors(itemEditSchema.safeParse({ quantity: "0" }).error!).quantity).toBe("Must be more than 0");
    expect(fieldErrors(itemEditSchema.safeParse({ quantity: "abc" }).error!).quantity).toBeTruthy();
    expect(fieldErrors(itemEditSchema.safeParse({ quantity: "2", unitPrice: "-5" }).error!).unitPrice).toBe("Cannot be negative");
  });
});

describe("auth validation", () => {
  it("validates sign in and sign up", () => {
    expect(fieldErrors(signInSchema.safeParse({ email: "nope", password: "" }).error!)).toEqual({
      email: "Enter a valid email address", password: "Enter your password",
    });
    const r = signUpSchema.safeParse({ name: "A", email: "a@b.ng", password: "short", city: "" });
    expect(Object.keys(fieldErrors(r.error!)).sort()).toEqual(["city", "name", "password"]);
    expect(signUpSchema.safeParse({ name: "Ada Obi", email: "ada@obi.ng", password: "longenough", city: "Abuja" }).success).toBe(true);
  });
  it("maps cities to states", () => {
    expect(stateOfCity("Abuja")).toBe("FCT");
    expect(stateOfCity("Ikorodu")).toBe("Lagos");
  });
});

describe("session tokens", () => {
  const secret = "test-secret-0123456789abcdef";
  it("round-trips a session", async () => {
    const t = await signSession({ userId: 42, name: "Chidinma Okafor" }, secret);
    expect(await verifySession(t, secret)).toEqual({ userId: 42, name: "Chidinma Okafor" });
  });
  it("rejects tampered, foreign and missing tokens", async () => {
    const t = await signSession({ userId: 42, name: "x" }, secret);
    expect(await verifySession(t.slice(0, -2) + "xx", secret)).toBeNull();
    expect(await verifySession(t, "another-secret-0123456789")).toBeNull();
    expect(await verifySession(undefined, secret)).toBeNull();
  });
});
