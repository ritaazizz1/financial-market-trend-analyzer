import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST() {
  const region = process.env.AWS_REGION!;
  const bucket = process.env.AWS_S3_BUCKET!;

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const sample = {
    ticker: "AAPL",
    points: [
      { date: "2025-12-15", close: 250.12 },
      { date: "2025-12-16", close: 252.34 },
      { date: "2025-12-17", close: 249.8 },
    ],
    createdAt: new Date().toISOString(),
  };

  const key = "raw/sample/aapl.json";

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(sample, null, 2),
      ContentType: "application/json",
    })
  );

  return NextResponse.json({ ok: true, key });
}
