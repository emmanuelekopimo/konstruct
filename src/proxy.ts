import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

// Optimistic check only: pages still load the user from the database.
export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/plans", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/plans/:path*", "/vendors/:path*", "/account/:path*", "/signin", "/signup"],
};
