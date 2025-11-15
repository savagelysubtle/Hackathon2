import { NextRequest } from 'next/server';
import { agentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a stream
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode('event: connected\ndata: {"status":"connected"}\n\n')
      );

      // Subscribe to agent updates
      const unsubscribe = agentService.subscribeToUpdates((event) => {
        const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Client disconnected from SSE');
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    },
  });
}

