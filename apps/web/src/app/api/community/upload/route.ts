import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceType = formData.get('resource_type') as 'image' | 'video';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          quality: 'auto:good',
        },
        (error, result) => {
          if (error) reject(new Error(error.message || 'Upload failed'));
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
      const debugInfo = {
        error: 'Upload failed',
        envVars: {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'PRESENT' : 'ABSENT',
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'PRESENT' : 'ABSENT',
          apiSecret: process.env.CLOUDINARY_API_SECRET ? 'PRESENT' : 'ABSENT',
        },
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'N/A',
      };
      console.error('[UPLOAD_ERROR]', debugInfo);
      return NextResponse.json(debugInfo, { status: 500 });
    }
}

// catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
//   }