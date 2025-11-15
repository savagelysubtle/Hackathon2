import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await agentService.getJob(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.schedule) {
      await agentService.updateJobSchedule(id, body.schedule);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

