import { NextResponse } from "next/server";

export async function GET() {
  // Mock data
  const history = [
    { date: "2025-11-10", value: 48000 },
    { date: "2025-11-11", value: 48500 },
    { date: "2025-11-12", value: 49000 },
    { date: "2025-11-13", value: 49500 },
    { date: "2025-11-14", value: 49200 },
    { date: "2025-11-15", value: 50000 },
  ];

  return NextResponse.json({ history });
}

