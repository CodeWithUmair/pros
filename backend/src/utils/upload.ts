// server/utils/upload.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.SPACES_REGION,
  endpoint: process.env.SPACES_ENDPOINT, // DigitalOcean endpoint
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

export async function uploadAvatar(fileBuffer: Buffer, fileName: string, mimetype: string) {
  const key = `avatars/${randomUUID()}-${fileName}`; // unique file name in bucket

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.SPACES_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ACL: "public-read", // so the file is publicly accessible
      ContentType: mimetype,
    })
  );

  return `${process.env.SPACES_ENDPOINT}/${process.env.SPACES_BUCKET}/${key}`;
}
