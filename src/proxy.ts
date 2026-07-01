import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["/:locale/admin(.*)", "/:locale/pro(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // API routes need Clerk's auth context (for currentUser()/auth() inside route
  // handlers) but must never go through next-intl's locale rewriting/redirects,
  // and must never be evaluated against the page-oriented isProtectedRoute
  // matcher below — "/api/admin/..." otherwise matches "/:locale/admin(.*)"
  // with "api" mistaken for the locale segment.
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)", "/(api|trpc)(.*)"],
};
