import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { thread_id: string } }
) {
  try {
    const { thread_id } = params;
    const { assistant_id } = await request.json();

    if (assistant_id !== 'recurring_executor') {
      return NextResponse.json(
        { error: 'Invalid assistant ID' },
        { status: 400 }
      );
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return completed run for compatibility
    return NextResponse.json({
      id: runId,
      thread_id,
      assistant_id,
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create run', details: error.message },
      { status: 500 }
    );
  }
}