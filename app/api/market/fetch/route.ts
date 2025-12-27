import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function toUpperSafe(s: string) {
  return s.trim().toUpperCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tickerRaw = searchParams.get("ticker") || "AAPL";
  const ticker = toUpperSafe(tickerRaw);

  // Stooq uses lowercase tickers. For US stocks, many work as just "aapl".
  // Some tickers may require suffixes later; we’ll handle that when needed.
  const stooqTicker = ticker.toLowerCase();

  const url = `https://stooq.com/q/d/l/?s=${stooqTicker}&i=d`; // daily CSV
  const res = await fetch(url);

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: `Fetch failed: ${res.status}` }, { status: 500 });
  }

  const csv = await res.text();

  // Store raw CSV in S3 (raw means: original response)
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const key = `raw/prices/ticker=${ticker}/date=${today}/stooq_daily.csv`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: csv,
      ContentType: "text/csv",
    })
  );

  // Minimal parsing: turn CSV into JSON for the UI
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = cols[i]));
    return obj;
  });

  return NextResponse.json({ ok: true, ticker, storedKey: key, rows: rows.slice(-30) }); // last 30 days
}
