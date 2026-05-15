import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.url.split(req.nextUrl.host)[1] ?? req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role;

  const isBanned = role === "banned";

  console.log("MIDDLEWARE PATH:", pathname);
  console.log("ROLE:", role);

  if (isBanned && pathname !== "/banned") {
    return NextResponse.redirect(new URL("/banned", req.url));
  }

  if (!isBanned && pathname === "/banned") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
