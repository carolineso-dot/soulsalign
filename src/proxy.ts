import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "sa_session";
const TRANSITION_COOKIE = "sa_seen_transition";

// Routes that require an authenticated session.
const PROTECTED = [
  "/discover",
  "/refine",
  "/you",
  "/profile",
  "/chat",
  "/plans",
  "/onboarding",
  "/verify",
];

// Public routes that an authenticated user should be bounced away from.
const AUTH_PAGES = ["/sign-in", "/sign-up"];

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthed(req);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated users cannot see protected app routes.
  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Authenticated users are pulled out of the auth pages, through the gate.
  if (isAuthPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/transition";
    return NextResponse.redirect(url);
  }

  // The transition gate: mandatory on every login AND every session restore.
  // `sa_seen_transition` is a SESSION cookie (no max-age), so it clears when the
  // browser closes — guaranteeing the transition shows again on next entry.
  if (pathname === "/transition") {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.cookies.set(TRANSITION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // no maxAge => session cookie
    });
    return res;
  }

  // Authed + entering the app without having passed the gate this session.
  if (isProtected && authed) {
    const seen = req.cookies.get(TRANSITION_COOKIE)?.value;
    if (!seen) {
      const url = req.nextUrl.clone();
      url.pathname = "/transition";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on app routes; skip static assets and API internals handled elsewhere.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|uploads|seed|manifest.webmanifest|sw.js).*)",
  ],
};
