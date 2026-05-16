import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // Check if the route is under /workspace but not /workspace/login
  if (request.nextUrl.pathname.startsWith("/workspace") && !request.nextUrl.pathname.startsWith("/workspace/login")) {
    const sessionCookie = request.cookies.get("session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/workspace/login", request.url));
    }

    try {
      const payload = await decrypt(sessionCookie);
      if (!payload || !payload.userId) {
        return NextResponse.redirect(new URL("/workspace/login", request.url));
      }
    } catch {
      // Token is invalid or expired
      return NextResponse.redirect(new URL("/workspace/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*"],
};
