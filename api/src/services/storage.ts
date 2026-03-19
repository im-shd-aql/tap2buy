import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { env } from "../config/env";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2AccessKeyId,
    secretAccessKey: env.r2SecretAccessKey,
  },
});

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<string> {
  const ext = path.extname(originalName);
  const key = `uploads/${uuidv4()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  // In dev without R2 configured, return a placeholder
  if (!env.r2PublicUrl) {
    return `/api/uploads/${key}`;
  }

  return `${env.r2PublicUrl}/${key}`;
}
