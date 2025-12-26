"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");
  const [data, setData] = useState<any>(null);

  async function upload() {
    setStatus("Uploading to S3...");
    setData(null);
    const res = await fetch("/api/s3/upload", { method: "POST" });
    const json = await res.json();
    setStatus(`Uploaded: ${json.key}`);
  }

  async function read() {
    setStatus("Reading from S3...");
    const res = await fetch("/api/s3/read");
    const json = await res.json();
    setData(json);
    setStatus("Read complete.");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Market Trend Analyzer</h1>
      <p className="mt-2 text-sm text-gray-600">MVP: S3 write + read.</p>

      <div className="mt-6 flex gap-3">
        <button className="rounded border px-4 py-2" onClick={upload}>
          Upload sample to S3
        </button>
        <button className="rounded border px-4 py-2" onClick={read}>
          Read sample from S3
        </button>
      </div>

      <p className="mt-4">{status}</p>

      {data && (
        <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}
