import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * S3-compatible storage utility for Contabo Object Storage
 * Replaces @vercel/blob for all file upload/delete operations
 */

const getS3Client = () => {
  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT
  const region = process.env.OBJECT_STORAGE_REGION
  const accessKeyId = process.env.OBJECT_STORAGE_KEY
  const secretAccessKey = process.env.OBJECT_STORAGE_SECRET

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing S3 storage configuration. Check OBJECT_STORAGE_* environment variables.',
    )
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required for S3-compatible services like Contabo
  })
}

const getBucket = () => {
  const bucket = process.env.OBJECT_STORAGE_BUCKET
  if (!bucket) {
    throw new Error('Missing OBJECT_STORAGE_BUCKET environment variable.')
  }
  return bucket
}

export interface UploadResult {
  url: string
  pathname: string
}

/**
 * Upload a file to S3-compatible storage
 * @param filename - The name/path for the file in the bucket
 * @param data - File data as Buffer
 * @param options - Upload options
 */
export async function uploadFile(
  filename: string,
  data: Buffer,
  options: {
    contentType: string
    access?: 'public' | 'private'
  },
): Promise<UploadResult> {
  const s3 = getS3Client()
  const bucket = getBucket()

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: data,
      ContentType: options.contentType,
      // For public files, set ACL if your bucket supports it
      // ACL: options.access === 'public' ? 'public-read' : 'private',
    }),
  )

  // Construct the public URL
  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT!
  const url = `${endpoint}/${bucket}/${filename}`

  return {
    url,
    pathname: filename,
  }
}

/**
 * Delete a file from S3-compatible storage
 * @param urlOrPath - The full URL or just the path/key of the file to delete
 */
export async function deleteFile(urlOrPath: string): Promise<void> {
  const s3 = getS3Client()
  const bucket = getBucket()

  // Extract the key from the URL if a full URL is provided
  let key = urlOrPath
  if (urlOrPath.startsWith('http')) {
    // URL format: https://endpoint/bucket/path/to/file
    const url = new URL(urlOrPath)
    const pathParts = url.pathname.split('/').filter(Boolean)
    // Skip the bucket name if it's in the path
    if (pathParts[0] === bucket) {
      key = pathParts.slice(1).join('/')
    } else {
      key = pathParts.join('/')
    }
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )
}

/**
 * Get a signed URL for temporary access to a file
 * @param key - The path/key of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const s3 = getS3Client()
  const bucket = getBucket()

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  return await getSignedUrl(s3, command, { expiresIn })
}
