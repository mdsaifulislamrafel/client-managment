import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const open = pathname === "/login" || pathname.startsWith("/api/auth/");
  const token = req.cookies.get("token")?.value;

  let ok = false;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      ok = true;
    } catch {}
  }

  if (open) {
    if (ok && pathname === "/login") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }
  if (!ok) {
    if (pathname.startsWith("/api/"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.jpg).*)"],
};
