import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await agentService.resumeJob(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
