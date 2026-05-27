import { NextRequest, NextResponse } from "next/server";
import { requireRoles } from "@/lib/auth-utils";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  await requireRoles(["OWNER"]);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No se recibió ningún archivo" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result: any = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "stock-local/logos",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return NextResponse.json({
    url: result.secure_url,
  });
}