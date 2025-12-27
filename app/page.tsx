"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");
  const [data, setData] = useState<any>(null);
  const [ticker, setTicker] = useState("AAPL");

  async function uploadSample() {
    setStatus("Uploading sample to S3...");
    setData(null);
    const res = await fetch("/api/s3/upload", { method: "POST" });
    const json = await res.json();
    setStatus(`Uploaded: ${json.key}`);
  }

  async function readSample() {
    setStatus("Reading sample from S3...");
    const res = await fetch("/api/s3/read");
    const json = await res.json();
    setData(json);
    setStatus("Read complete.");
  }

  async function fetchMarket() {
    setStatus(`Fetching ${ticker} from Stooq...`);
    setData(null);
    const res = await fetch(`/api/market/fetch?ticker=${encodeURIComponent(ticker)}`);
    const json = await res.json();

    if (!json.ok) {
      setStatus(`Error: ${json.error}`);
      return;
    }

    setData(json);
    setStatus(`Stored raw data at: ${json.storedKey}`);
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Market Trend Analyzer</h1>
      <p className="mt-2 text-sm text-gray-600">
        Next step: fetch real market data and store raw responses in S3.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className="rounded border px-4 py-2" onClick={uploadSample}>
          Upload sample to S3
        </button>
        <button className="rounded border px-4 py-2" onClick={readSample}>
          Read sample from S3
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          className="rounded border px-3 py-2"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker (e.g., AAPL)"
        />
        <button className="rounded border px-4 py-2" onClick={fetchMarket}>
          Fetch real data (store to S3)
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
