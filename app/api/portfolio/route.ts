import { NextResponse } from 'next/server';
import { agentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await agentService.getPortfolioSnapshot();
    return NextResponse.json(snapshot);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
