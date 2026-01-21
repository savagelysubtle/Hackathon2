import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// In-memory storage for thread messages (replace with database in production)
const threadMessages = new Map<string, any[]>();

// Initialize LLM (basic version without tools for now)
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request,
  { params }: { params: { thread_id: string } }
) {
  try {
    const { thread_id } = params;
    const { role, content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get existing messages for this thread
    const messages = threadMessages.get(thread_id) || [];

    // Add user message
    messages.push({
      role: 'human',
      content,
      created_at: new Date().toISOString(),
    });

    // Generate AI response
    let aiResponse = 'I apologize, but I\'m currently running in demo mode. The full LangGraph agent with portfolio management, triggers, and DeFi capabilities is being initialized. Please try again in a moment.';

    try {
      // Try to get a real response from the LLM
      const response = await llm.invoke([
        {
          role: 'system',
          content: 'You are a helpful DeFi assistant. Keep responses concise and focused on portfolio management, trading, and blockchain operations.'
        },
        {
          role: 'human',
          content,
        }
      ]);

      aiResponse = response.content as string;
    } catch (error) {
      console.error('LLM error:', error);
      // Keep the demo message
    }

    // Add AI response
    const aiMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse,
      created_at: new Date().toISOString(),
    };

    messages.push(aiMessage);

    // Store updated messages
    threadMessages.set(thread_id, messages);

    return NextResponse.json(aiMessage);
  } catch (error: any) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { thread_id: string } }
) {
  try {
    const { thread_id } = params;
    const messages = threadMessages.get(thread_id) || [];

    return NextResponse.json({ data: messages });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get messages', details: error.message },
      { status: 500 }
    );
  }
}