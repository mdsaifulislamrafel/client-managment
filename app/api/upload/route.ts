import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
const FOLDER = "office-manager/agreements";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "ফাইল নেই" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "শুধু ছবি আপলোড করা যাবে" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024)
    return NextResponse.json({ error: "ছবি ১০MB এর বেশি" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const r: any = await new Promise((resolve, reject) =>
      cloudinary.uploader
        .upload_stream({ folder: FOLDER, resource_type: "image" }, (e, res) =>
          e ? reject(e) : resolve(res)
        )
        .end(buffer)
    );
    return NextResponse.json({ url: r.secure_url, publicId: r.public_id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "আপলোড ব্যর্থ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { publicId } = await req.json().catch(() => ({}));
  if (typeof publicId !== "string" || !publicId.startsWith("office-manager/"))
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await cloudinary.uploader.destroy(publicId);
  return NextResponse.json({ ok: true });
}
