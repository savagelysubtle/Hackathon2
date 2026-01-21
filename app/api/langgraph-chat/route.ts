import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      deploymentUrl = 'http://localhost:2024',
      graphId = 'agent',
      threadId,
      apiKey
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!deploymentUrl || !graphId) {
      return new Response(JSON.stringify({ error: 'Deployment URL and Graph ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a new thread if one doesn't exist
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const threadResponse = await fetch(`${deploymentUrl}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
      });

      if (!threadResponse.ok) {
        throw new Error('Failed to create thread');
      }

      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
    }

    // Send message to LangGraph
    console.log(`Sending message to LangGraph: ${deploymentUrl}/threads/${currentThreadId}/messages`);
    const messageResponse = await fetch(`${deploymentUrl}/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        role: 'human',
        content: message,
      }),
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('LangGraph API error:', errorText);

      // If the LangGraph server fails, fall back to demo mode
      if (errorText.includes('API key') || errorText.includes('openai') || errorText.includes('timeout')) {
        console.log('Falling back to demo mode due to LangGraph API issues');

        // Simulate streaming for demo mode
        const demoResponse = "I apologize, but I'm currently unable to connect to the LangGraph server. This might be due to missing API configuration. You can try:\n\n1. Check that your LangGraph server is running\n2. Ensure the OpenAI API key is configured\n3. Verify the deployment URL and graph ID\n\nFor now, I'll operate in demo mode with simulated responses.";

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const words = demoResponse.split(' ');
              for (const word of words) {
                const data = JSON.stringify({
                  type: 'token',
                  content: word + ' ',
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                await new Promise((resolve) => setTimeout(resolve, 30));
              }

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

      throw new Error(`Failed to send message: ${errorText}`);
    }

    const messageData = await messageResponse.json();
    console.log('LangGraph response:', messageData);

    // Return the response in streaming format compatible with the chat widget
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the response content word by word for typing effect
          const content = messageData.content || 'I received your message but couldn\'t process it properly.';
          const words = content.split(' ');

          for (const word of words) {
            const data = JSON.stringify({
              type: 'token',
              content: word + ' ',
              threadId: currentThreadId,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            // Small delay between words for typing effect
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          // Send mode indicator and completion
          const modeData = JSON.stringify({ type: 'mode', mode: 'langgraph' });
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
  } catch (error: any) {
    console.error('LangGraph chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}