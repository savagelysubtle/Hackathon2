import { NextResponse } from 'next/server';

// In-memory storage for threads (replace with database in production)
const threads = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const thread = {
      id: threadId,
      created_at: new Date().toISOString(),
      metadata: {},
    };

    threads.set(threadId, thread);

    return NextResponse.json(thread);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}