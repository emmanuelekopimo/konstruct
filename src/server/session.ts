import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { getUser } from "@/db/queries";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession, type SessionPayload } from "@/lib/jwt";

export async function startSession(p: SessionPayload) {
  const token = await signSession(p);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
});

/** The signed-in user, or a redirect to sign in. */
export const requireUser = cache(async () => {
  const s = await getSession();
  if (!s) redirect("/signin");
  const user = await getUser(db, s.userId);
  if (!user) redirect("/signin");
  return user;
});
