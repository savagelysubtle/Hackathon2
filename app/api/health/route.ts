import { NextResponse } from "next/server";

export async function GET() {
  // Mock data
  const health = {
    status: "healthy",
    lastCheck: new Date().toISOString(),
    checks: {
      balances: "ok",
      oracle: "ok",
      rpc: "ok",
      scheduler: "ok",
    },
  };

  return NextResponse.json(health);
}

