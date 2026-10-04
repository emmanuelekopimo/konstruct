import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "konstruct_session";
export const SESSION_DAYS = 7;

export type SessionPayload = { userId: number; name: string };

function key(secret: string | undefined = process.env.SESSION_SECRET): Uint8Array {
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (16+ chars)");
    return new TextEncoder().encode("konstruct-dev-secret-not-for-production");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(p: SessionPayload, secret?: string): Promise<string> {
  return new SignJWT({ name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(p.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key(secret));
}

export async function verifySession(token: string | undefined, secret?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return { userId, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
