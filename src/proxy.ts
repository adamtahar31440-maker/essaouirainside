import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["/:locale/admin(.*)", "/:locale/pro(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // API routes need Clerk's auth context (for currentUser()/auth() inside route
  // handlers) but must never go through next-intl's locale rewriting/redirects.
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)", "/(api|trpc)(.*)"],
};
