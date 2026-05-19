import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;
  const role = token?.role as string;

  const isBanned = role === "banned";
  const isEmployer = role === "employer";

  // Разрешённые пути для работодателя
  const employerAllowedPaths = [
    "/",
    "/profile",
    "/employer",
    "/api/employer",
    "/api/auth",
    "/_next",
    "/favicon.ico",
  ];
  const employerBlockedPaths = [
    "/topics",
    "/materials",
    "/admin",
    "/teacher",
    "/level",
    "/projects",
  ];

  const publicPaths = ["/", "/auth", "/api/auth", "/_next", "/favicon.ico"];

  console.log("MIDDLEWARE PATH:", pathname);
  console.log("ROLE:", role);

  // Проверка на бана
  if (isBanned && pathname !== "/banned") {
    return NextResponse.redirect(new URL("/banned", req.url));
  }

  if (!isBanned && pathname === "/banned") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isEmployer) {
    if (
      employerBlockedPaths.some((blockedPath) =>
        pathname.startsWith(blockedPath),
      )
    ) {
      return NextResponse.redirect(new URL("/employer", req.url));
    }
    const isAllowed = employerAllowedPaths.some(
      (allowedPath) =>
        pathname === allowedPath || pathname.startsWith(allowedPath),
    );
    const isPublic = publicPaths.some(
      (publicPath) =>
        pathname === publicPath || pathname.startsWith(publicPath),
    );

    if (!isAllowed && !isPublic && pathname !== "/") {
      return NextResponse.redirect(new URL("/employer", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
