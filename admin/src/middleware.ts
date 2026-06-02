import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("tap2buy_admin_token");

  if (!token?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/stores/:path*",
    "/sellers/:path*",
    "/orders/:path*",
    "/analytics/:path*",
    "/payouts/:path*",
  ],
};
