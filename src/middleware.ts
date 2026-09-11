import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin/auth";

const PASSWORD_CHANGE_PATH = "/admin/passwort-aendern";
const LOGIN_PATH = "/admin/login";

// Single source of truth for /admin/* route protection — deliberately
// path-aware here (rather than in the protected layout) so the forced
// password-change redirect can exempt its own route without looping.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname === LOGIN_PATH) {
    // Already authenticated — send straight to the app instead of
    // re-showing the login form (still honoring a pending forced
    // password change, same as any other route below).
    if (session) {
      return NextResponse.redirect(new URL(session.p ? PASSWORD_CHANGE_PATH : "/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const onPasswordChangeRoute = pathname === PASSWORD_CHANGE_PATH;
  if (session.p && !onPasswordChangeRoute) {
    return NextResponse.redirect(new URL(PASSWORD_CHANGE_PATH, request.url));
  }
  if (!session.p && onPasswordChangeRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
