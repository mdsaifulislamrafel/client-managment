import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import crypto from "crypto";

const tries = new Map<string, { n: number; t: number }>();
const h = (s: string) => crypto.createHash("sha256").update(s).digest();
const WINDOW = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rec = tries.get(ip);
  if (rec && rec.n >= 5 && Date.now() - rec.t < WINDOW)
    return NextResponse.json(
      { error: "অনেকবার ভুল হয়েছে। ১৫ মিনিট পরে চেষ্টা করুন।" },
      { status: 429 }
    );

  const { username = "", password = "" } = await req.json().catch(() => ({}));
  const okU = crypto.timingSafeEqual(h(String(username)), h(process.env.ADMIN_USERNAME || "\0"));
  const okP = crypto.timingSafeEqual(h(String(password)), h(process.env.ADMIN_PASSWORD || "\0"));

  if (!(okU && okP)) {
    const fresh = !rec || Date.now() - rec.t >= WINDOW;
    tries.set(ip, { n: fresh ? 1 : rec!.n + 1, t: Date.now() });
    return NextResponse.json({ error: "ইউজারনেম বা পাসওয়ার্ড ভুল" }, { status: 401 });
  }

  tries.delete(ip);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });
  return res;
}
