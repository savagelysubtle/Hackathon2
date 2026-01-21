import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { graph } from './graph.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.LANGGRAPH_PORT || '2024', 10);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for threads and their state
const threads = new Map<string, {
  messages: BaseMessage[];
  values: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}>();

const assistants = new Map<string, {
  assistant_id: string;
  graph_id: string;
  name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}>();

// Initialize default assistant
const defaultAssistant = {
  assistant_id: 'agent',
  graph_id: 'agent',
  name: 'Recurring Executor Agent',
  metadata: {
    description: 'AI-powered DeFi portfolio automation with scheduled rebalancing, price-based triggers, and natural language control. Built for Warden Protocol Agent Hub.',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
assistants.set('agent', defaultAssistant);

// ==================== Health & Info Endpoints ====================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Get server info
app.get('/info', (_req: Request, res: Response) => {
  res.json({
    version: '0.1.0',
    graphs: ['agent'],
  });
});

// ==================== Assistant Endpoints ====================

// List assistants
app.get('/assistants/search', (_req: Request, res: Response) => {
  const assistantList = Array.from(assistants.values());
  res.json(assistantList);
});

// Get assistant by ID
app.get('/assistants/:assistant_id', (req: Request, res: Response) => {
  const assistant_id = req.params.assistant_id as string;
  const assistant = assistants.get(assistant_id);

  if (!assistant) {
    return res.status(404).json({ error: 'Assistant not found' });
  }

  res.json(assistant);
});

// ==================== Helper Functions ====================

// Helper to format messages for LangGraph SDK
function formatMessagesForResponse(messages: BaseMessage[]) {
  return messages.map((m, i) => ({
    type: m._getType(),
    id: `msg_${i}_${Date.now()}`,
    content: m.content,
    additional_kwargs: {},
    response_metadata: {},
  }));
}

// Helper to create a state snapshot
function createStateSnapshot(thread_id: string, thread: { messages: BaseMessage[]; values: Record<string, unknown>; createdAt: Date; updatedAt: Date }) {
  const checkpointId = `checkpoint_${Date.now()}`;
  return {
    values: {
      messages: formatMessagesForResponse(thread.messages),
      ...thread.values,
    },
    next: [],
    tasks: [],
    config: {
      configurable: {
        thread_id,
        checkpoint_ns: '',
        checkpoint_id: checkpointId,
      },
    },
    metadata: {
      source: 'loop',
      writes: {},
      step: 1,
    },
    created_at: thread.updatedAt.toISOString(),
    parent_config: null,
  };
}

// ==================== Thread Endpoints ====================

// Search threads
app.post('/threads/search', (req: Request, res: Response) => {
  const { metadata, limit, offset } = req.body;

  // Return all threads as an array
  const threadList = Array.from(threads.entries()).map(([thread_id, thread]) => ({
    thread_id,
    metadata: {},
    values: thread.values,
    created_at: thread.createdAt.toISOString(),
    updated_at: thread.updatedAt.toISOString(),
  }));

  // Apply pagination if provided
  const start = offset || 0;
  const end = limit ? start + limit : threadList.length;

  res.json(threadList.slice(start, end));
});

// Create a new thread
app.post('/threads', (req: Request, res: Response) => {
  const threadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const metadata = req.body.metadata || {};

  threads.set(threadId, {
    messages: [],
    values: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.json({
    thread_id: threadId,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
});

// Get thread by ID
app.get('/threads/:thread_id', (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;
  const thread = threads.get(thread_id);

  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  res.json({
    thread_id,
    values: thread.values,
    created_at: thread.createdAt.toISOString(),
    updated_at: thread.updatedAt.toISOString(),
  });
});

// Get thread state
app.get('/threads/:thread_id/state', (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;
  let thread = threads.get(thread_id);

  // Create thread if doesn't exist
  if (!thread) {
    thread = {
      messages: [],
      values: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    threads.set(thread_id, thread);
  }

  res.json(createStateSnapshot(thread_id, thread));
});

// Update thread state
app.post('/threads/:thread_id/state', async (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;
  const { values } = req.body;

  let thread = threads.get(thread_id);
  if (!thread) {
    // Create thread if it doesn't exist
    thread = {
      messages: [],
      values: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    threads.set(thread_id, thread);
  }

  // Update values
  if (values) {
    thread.values = { ...thread.values, ...values };
    thread.updatedAt = new Date();
  }

  res.json({ ok: true });
});

// ==================== Run Endpoints ====================

// Helper function to convert messages
function convertMessage(msg: { role: string; content: string }): BaseMessage {
  if (msg.role === 'human' || msg.role === 'user') {
    return new HumanMessage(msg.content);
  }
  return new AIMessage(msg.content);
}

// Create a run (invoke the graph)
app.post('/threads/:thread_id/runs', async (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;
  const { assistant_id, input, stream_mode } = req.body;

  // Get or create thread
  let thread = threads.get(thread_id);
  if (!thread) {
    thread = {
      messages: [],
      values: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    threads.set(thread_id, thread);
  }

  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  try {
    // Build messages from input
    let newMessages: BaseMessage[] = [];
    if (input?.messages) {
      newMessages = input.messages.map(convertMessage);
    }

    // Add to thread history
    thread.messages.push(...newMessages);

    // Invoke the graph
    const config = {
      configurable: {
        thread_id,
      },
    };

    const result = await graph.invoke(
      {
        messages: thread.messages,
        walletAddress: input?.walletAddress,
      },
      config,
    );

    // Extract new messages from result
    if (result.messages) {
      // Update thread with result messages
      thread.messages = result.messages;
      thread.values = {
        portfolio: result.portfolio,
        triggers: result.triggers,
        lastRebalance: result.lastRebalance,
        lastTriggerCheck: result.lastTriggerCheck,
        needsRebalancing: result.needsRebalancing,
      };
    }

    thread.updatedAt = new Date();

    // Return run result
    res.json({
      run_id: runId,
      thread_id,
      assistant_id: assistant_id || 'agent',
      status: 'success',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error running graph:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      run_id: runId,
      thread_id,
      assistant_id: assistant_id || 'agent',
      status: 'error',
      error: errorMessage,
    });
  }
});

// Stream a run
app.post('/threads/:thread_id/runs/stream', async (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;
  const { assistant_id, input, stream_mode } = req.body;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Get or create thread
  let thread = threads.get(thread_id);
  if (!thread) {
    thread = {
      messages: [],
      values: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    threads.set(thread_id, thread);
  }

  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  try {
    // Build messages from input
    let newMessages: BaseMessage[] = [];
    if (input?.messages) {
      newMessages = input.messages.map(convertMessage);
    }

    // Add to thread history
    thread.messages.push(...newMessages);

    // Send metadata event
    res.write(`event: metadata\ndata: ${JSON.stringify({ run_id: runId })}\n\n`);

    // Invoke the graph with streaming
    const config = {
      configurable: {
        thread_id,
      },
    };

    // Stream updates from the graph
    const stream = await graph.stream(
      {
        messages: thread.messages,
        walletAddress: input?.walletAddress,
      },
      {
        ...config,
        streamMode: 'updates',
      },
    );

    for await (const chunk of stream) {
      // Send updates event
      res.write(`event: updates\ndata: ${JSON.stringify(chunk)}\n\n`);

      // Also send values event for compatibility
      res.write(`event: values\ndata: ${JSON.stringify(chunk)}\n\n`);
    }

    // Get final state
    const state = await graph.getState({ configurable: { thread_id } });

    // Update thread
    if (state.values) {
      thread.messages = state.values.messages || thread.messages;
      thread.values = {
        portfolio: state.values.portfolio,
        triggers: state.values.triggers,
        lastRebalance: state.values.lastRebalance,
        lastTriggerCheck: state.values.lastTriggerCheck,
        needsRebalancing: state.values.needsRebalancing,
      };
    }
    thread.updatedAt = new Date();

    // Send end event
    res.write(`event: end\ndata: null\n\n`);
    res.end();
  } catch (error: unknown) {
    console.error('Error streaming graph:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Wait for run to complete (for async runs)
app.get('/threads/:thread_id/runs/:run_id/join', async (req: Request, res: Response) => {
  const { thread_id, run_id } = req.params;

  // Since we run synchronously, just return success
  res.json({
    run_id,
    thread_id,
    status: 'success',
  });
});

// Get run status
app.get('/threads/:thread_id/runs/:run_id', (req: Request, res: Response) => {
  const { thread_id, run_id } = req.params;

  res.json({
    run_id,
    thread_id,
    status: 'success',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
});

// ==================== History Endpoints ====================

// Get thread history - returns array of state snapshots
app.get('/threads/:thread_id/history', (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;
  let thread = threads.get(thread_id);

  // Create thread if it doesn't exist (for new conversations)
  if (!thread) {
    thread = {
      messages: [],
      values: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    threads.set(thread_id, thread);
  }

  // Return array of state snapshots (LangGraph SDK expects an array)
  res.json([createStateSnapshot(thread_id, thread)]);
});

// POST thread history - also returns array of state snapshots
app.post('/threads/:thread_id/history', (req: Request, res: Response) => {
  const thread_id = req.params.thread_id as string;

  // Get or create thread
  let thread = threads.get(thread_id);
  if (!thread) {
    thread = {
      messages: [],
      values: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    threads.set(thread_id, thread);
  }

  // Return array of state snapshots
  res.json([createStateSnapshot(thread_id, thread)]);
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         🚀 LangGraph Server - Recurring Executor Agent        ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  Server URL:    http://localhost:${PORT}                         ║`);
  console.log('║  Assistant ID:  agent                                         ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  Connect to Agent Chat:                                       ║');
  console.log('║    Deployment URL: http://localhost:2024                      ║');
  console.log('║    Graph ID:       agent                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📖 API Endpoints:');
  console.log('   GET  /health                          - Health check');
  console.log('   GET  /info                            - Server info');
  console.log('   GET  /assistants/search               - List assistants');
  console.log('   GET  /assistants/:id                  - Get assistant');
  console.log('   POST /threads                         - Create thread');
  console.log('   GET  /threads/:id                     - Get thread');
  console.log('   GET  /threads/:id/state               - Get thread state');
  console.log('   POST /threads/:id/state               - Update thread state');
  console.log('   POST /threads/:id/runs                - Create run');
  console.log('   POST /threads/:id/runs/stream         - Stream run');
  console.log('   GET  /threads/:id/runs/:run_id        - Get run status');
  console.log('   GET  /threads/:id/history             - Get thread history');
  console.log('');
});

export default app;
