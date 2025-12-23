import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const trigger = await agentService.getTrigger(id);

    if (!trigger) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    return NextResponse.json({ trigger });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await agentService.updateTrigger(id, body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await agentService.deleteTrigger(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
