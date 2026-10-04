"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { createUser, findUserByEmail } from "@/db/queries";
import { fieldErrors, signInSchema, signUpSchema, stateOfCity, type FieldErrors } from "@/lib/validation";
import { endSession, startSession } from "@/server/session";

export type AuthState = { errors: FieldErrors; values: Record<string, string> };

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const values = { email: String(form.get("email") ?? ""), password: "" };
  const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const user = await findUserByEmail(db, parsed.data.email);
  const ok = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return { errors: { form: "Email or password is incorrect." }, values };
  await startSession({ userId: user.id, name: user.name });
  redirect("/plans");
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const values = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    city: String(form.get("city") ?? ""),
  };
  const parsed = signUpSchema.safeParse({ ...values, password: form.get("password") ?? "" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  if (await findUserByEmail(db, parsed.data.email)) {
    return { errors: { email: "An account with this email already exists." }, values };
  }
  const user = await createUser(db, {
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
    city: parsed.data.city,
    state: stateOfCity(parsed.data.city),
  });
  await startSession({ userId: user.id, name: user.name });
  redirect("/plans");
}

export async function signOut() {
  await endSession();
  redirect("/signin");
}
