import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
 "/dashboard(.*)",
 "/creator/dashboard(.*)",
 "/creator/upload(.*)",
 "/creator/videos(.*)",
 "/creator/series(.*)",
 "/creator/analytics(.*)",
 "/creator/earnings(.*)",
 "/creator/settings(.*)",
 "/creator/help(.*)",
 "/onboarding", // Keep as fallback for edge cases
]);

export default clerkMiddleware(async (auth, req) => {
 if (isProtectedRoute(req)) {
 await auth.protect();
 }
});

export const config = {
 matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
