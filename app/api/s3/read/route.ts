import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

export async function GET() {
  const region = process.env.AWS_REGION!;
  const bucket = process.env.AWS_S3_BUCKET!;

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = "raw/sample/aapl.json";

  const obj = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  const body = await streamToString(obj.Body);
  return NextResponse.json(JSON.parse(body));
}
