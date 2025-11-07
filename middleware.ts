import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // update user's auth session and handle route protection
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - _not-found (Next.js internal error page)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|_not-found|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
