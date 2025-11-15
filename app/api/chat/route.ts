import { NextRequest } from 'next/server';
import { getChatAgent } from '@/lib/chat-agent';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const chatAgent = getChatAgent();
    const encoder = new TextEncoder();

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the response
          for await (const chunk of chatAgent.chatStream(message)) {
            const data = JSON.stringify({ type: 'token', content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send completion signal
          const completeData = JSON.stringify({ type: 'complete' });
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));
        } catch (error: any) {
          const errorData = JSON.stringify({ type: 'error', error: error.message });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

