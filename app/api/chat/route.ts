import { NextRequest } from 'next/server';
import { getChatAgent } from '@/lib/chat-agent';
import { getMockResponse } from './mock';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, userApiKey, testMode } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Test mode: Just validate the key format
    if (testMode) {
      if (userApiKey && userApiKey.startsWith('sk-')) {
        return new Response(JSON.stringify({ valid: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ valid: false }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Check if we should use demo mode or real AI
    const hasServerKey = !!process.env.OPENAI_API_KEY;
    const hasUserKey = userApiKey && userApiKey.startsWith('sk-');
    const shouldUseMock = !hasServerKey && !hasUserKey;

    // DEMO MODE: Use mock responses
    if (shouldUseMock) {
      const mockResponse = getMockResponse(message);
      const encoder = new TextEncoder();

      // Simulate streaming for realistic feel
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Simulate delay
            await new Promise((resolve) =>
              setTimeout(resolve, mockResponse.delay),
            );

            // Stream the mock response word by word
            const words = mockResponse.response.split(' ');
            for (const word of words) {
              const data = JSON.stringify({
                type: 'token',
                content: word + ' ',
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              // Small delay between words for typing effect
              await new Promise((resolve) => setTimeout(resolve, 30));
            }

            // Send mode indicator and completion
            const modeData = JSON.stringify({ type: 'mode', mode: 'demo' });
            controller.enqueue(encoder.encode(`data: ${modeData}\n\n`));

            const completeData = JSON.stringify({ type: 'complete' });
            controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));
          } catch (error: any) {
            const errorData = JSON.stringify({
              type: 'error',
              error: error.message,
            });
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
          Connection: 'keep-alive',
        },
      });
    }

    // FULL MODE: Use real AI (either user's key or server key)
    const chatAgent = getChatAgent(hasUserKey ? userApiKey : undefined);
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

          // Send mode indicator
          const modeData = JSON.stringify({
            type: 'mode',
            mode: hasUserKey ? 'full-user' : 'full-server',
          });
          controller.enqueue(encoder.encode(`data: ${modeData}\n\n`));

          // Send completion signal
          const completeData = JSON.stringify({ type: 'complete' });
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));
        } catch (error: any) {
          const errorData = JSON.stringify({
            type: 'error',
            error: error.message,
          });
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
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
