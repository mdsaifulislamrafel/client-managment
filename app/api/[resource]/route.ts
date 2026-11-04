import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { registry } from "@/models";

type Ctx = { params: { resource: string } };
const bad = (e: any) => NextResponse.json({ error: e.message || "Error" }, { status: 400 });
const nf = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET(_: NextRequest, { params }: Ctx) {
  const M = registry[params.resource];
  if (!M) return nf();
  await connectDB();
  return NextResponse.json(await M.find().sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const M = registry[params.resource];
  if (!M) return nf();
  try {
    await connectDB();
    const body = await req.json();
    delete body._id;
    return NextResponse.json(await M.create(body), { status: 201 });
  } catch (e) {
    return bad(e);
  }
}
