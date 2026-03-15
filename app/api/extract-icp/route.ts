import { NextRequest, NextResponse } from "next/server";

const ICP_EXTRACTOR_URL =
  process.env.ICP_EXTRACTOR_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url?.trim();
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${ICP_EXTRACTOR_URL}/extract-icp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(120000),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Extraction failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to extract ICP";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
