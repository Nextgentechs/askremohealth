import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { env } from "@web/env.js";

const s3 = new S3Client({
  region: env.OBJECT_STORAGE_REGION ?? "",
  endpoint: env.OBJECT_STORAGE_ENDPOINT ?? "",
  credentials: {
    accessKeyId: env.OBJECT_STORAGE_KEY ?? "",
    secretAccessKey: env.OBJECT_STORAGE_SECRET ?? "",
  },
  forcePathStyle: true,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const certificateName = searchParams.get("name");

    if (!certificateName) {
      return NextResponse.json({ error: "Certificate name is required" }, { status: 400 });
    }

    if (!env.OBJECT_STORAGE_BUCKET) {
      return NextResponse.json({ error: "Object storage not configured" }, { status: 500 });
    }

    const command = new GetObjectCommand({
      Bucket: env.OBJECT_STORAGE_BUCKET,
      Key: certificateName,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
