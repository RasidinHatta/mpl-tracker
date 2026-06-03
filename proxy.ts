import { NextRequest, NextResponse } from "next/server";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { authRoutes, protectedRoutes, publicRoutes } from "./route";

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);

  const isLoggedIn = !!sessionCookie;
  const pathname = nextUrl.pathname;

  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Explicitly allow public routes without further checks
  const isOnPublicRoute = publicRoutes.some((route: string) => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route;
  });

  if (isOnPublicRoute) {
    return NextResponse.next();
  }

  // Check if on protected route (supports exact match and /* wildcard prefix)
  const isOnProtectedRoute = protectedRoutes.some((route: string) => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route;
  });

  // Check if on auth route (supports exact match and /* wildcard prefix)
  const isOnAuthRoute = authRoutes.some((route: string) => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route;
  });

  // Redirect unauthenticated users away from protected routes
  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    let userRole: string | undefined;
    try {
      const sessionCache = await getCookieCache(req, {
        secret: process.env.BETTER_AUTH_SECRET,
      });
      userRole = (sessionCache?.user as { role?: string } | undefined)?.role;
    } catch {
      userRole = undefined;
    }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
