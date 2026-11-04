import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { registry } from "@/models";

type Ctx = { params: { resource: string; id: string } };
const bad = (e: any) => NextResponse.json({ error: e.message || "Error" }, { status: 400 });
const nf = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET(_: NextRequest, { params }: Ctx) {
  const M = registry[params.resource];
  if (!M) return nf();
  try {
    await connectDB();
    const doc = await M.findById(params.id).lean();
    return doc ? NextResponse.json(doc) : nf();
  } catch (e) {
    return bad(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const M = registry[params.resource];
  if (!M) return nf();
  try {
    await connectDB();
    const body = await req.json();
    for (const k of ["_id", "__v", "createdAt", "updatedAt"]) delete body[k];
    const doc = await M.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    return doc ? NextResponse.json(doc) : nf();
  } catch (e) {
    return bad(e);
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const M = registry[params.resource];
  if (!M) return nf();
  try {
    await connectDB();
    const doc: any = await M.findByIdAndDelete(params.id);
    if (!doc) return nf();
    // সাইন করা এগ্রিমেন্টের ছবিও Cloudinary থেকে মুছে ফেলা হবে
    await Promise.all(
      (doc.agreementImages || []).map((i: any) =>
        i.publicId ? cloudinary.uploader.destroy(i.publicId).catch(() => null) : null
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return bad(e);
  }
}
