# 🎮 **Dashboard Agent Prompt: Phase 2 - Interactive Controls**
## **Adding User Control & Agent Communication**

---

## **📋 Context: What You've Already Built**

You've successfully created a **beautiful, read-only dashboard** with:
- ✅ Overview page (portfolio metrics, triggers)
- ✅ Portfolio page (allocation charts, history)
- ✅ Triggers page (active triggers, progress)
- ✅ Scheduler page (cron jobs, execution logs)
- ✅ Activity page (complete audit trail)
- ✅ Professional dark theme UI
- ✅ Excellent data visualizations

**Current Score**: 95/100 ⭐⭐⭐⭐⭐

---

## **🎯 NEW GOAL: Make Dashboard Interactive**

### **Problem Statement**

The dashboard currently **displays data** but **cannot control the agent**:
- ❌ Users can't create new triggers
- ❌ Users can't modify existing triggers
- ❌ Users can't change schedules
- ❌ Users can't configure portfolio allocation
- ❌ Users can't pause/resume jobs
- ❌ Users can't execute manual actions

### **Solution Required**

Add **two-way communication** between dashboard and agent:
1. **Chat Interface** - Natural language agent control (AI-powered)
2. **Interactive Forms** - Traditional UI controls
3. **API Backend** - Connect dashboard to TypeScript agent
4. **Real-time Updates** - WebSocket/SSE for live data
5. **Agent Integration** - Use Warden Agent Kit + LangChain

---

## **🏗️ Architecture Overview**

### **Current Architecture** (Read-Only)
```
Dashboard (Next.js) → Mock Data (Static JSON)
```

### **New Architecture** (Interactive)
```
Dashboard (Next.js/React)
    ↕️ HTTP/REST + WebSocket
API Server (Express/Next.js API Routes)
    ↕️ Function Calls
Recurring Executor Agent (TypeScript)
    ↕️ Blockchain Calls
Warden Protocol + EVM Chains
```

---

## **🎨 Feature Requirements**

### **1. Chat Interface** 💬

**Location**: New floating chat widget (bottom-right) OR new Chat page

**Features Required**:
- ✅ Chat input box
- ✅ Message history display
- ✅ Agent response streaming
- ✅ Command suggestions/autocomplete
- ✅ Chat history persistence
- ✅ Typing indicators

**Example User Commands**:
```
User: "Create a trigger to sell 10% SOL if it pumps 20%"
Agent: "✅ Created SOL trigger: Sell 10% at +20% from current price ($215)"

User: "Change ETH trigger threshold to 25%"
Agent: "✅ Updated ETH trigger threshold from 20% to 25%"

User: "Pause weekly rebalancing"
Agent: "✅ Paused 'Weekly Portfolio Rebalance' job"

User: "Show me my current triggers"
Agent: "You have 2 active triggers:
1. SOL: Sell 10% at +15% ($230 target)
2. ETH: Sell 5% at +25% ($4,375 target)"

User: "What's my portfolio worth?"
Agent: "Your portfolio is currently worth $50,000:
- ETH: $30,000 (60%)
- USDC: $20,000 (40%)"
```

**Tech Stack**:
- Frontend: React component with chat UI
- Backend: LangChain + OpenAI integration
- Agent: Warden Agent Kit tools wrapped as LangChain tools
- Streaming: Server-Sent Events (SSE) or WebSocket

**UI Requirements**:
- Clean chat bubbles (user vs agent)
- Markdown support for agent responses
- Code blocks for displaying data
- Action confirmation buttons
- Error handling with clear messages

---

### **2. Interactive Forms** 📝

**2a. Create Trigger Modal**

**Location**: Triggers page → "Create Trigger" button

**Form Fields**:
- Asset/Currency Pair (dropdown: SOL/USD, ETH/USD, BTC/USD)
- Baseline Price (auto-filled with current price, editable)
- Threshold Percentage (number input, e.g., 15%)
- Direction (radio: Above/Below)
- Action Percentage (number input, e.g., 10%)
- Trigger Name (text input, optional)

**Example**:
```
┌─────────────────────────────────────┐
│  Create Price Trigger               │
├─────────────────────────────────────┤
│  Asset: [SOL/USD ▼]                 │
│  Baseline: $215.00 (current)        │
│  Threshold: [15] %                  │
│  Direction: ⚫ Above  ⚪ Below       │
│  Action: Sell [10] %                │
│  Name: [SOL 15% Pump]               │
│                                     │
│  [Cancel]  [Create Trigger]         │
└─────────────────────────────────────┘
```

**Validation**:
- Threshold must be > 0 and < 100
- Action percentage must be > 0 and ≤ 100
- Baseline price must be > 0
- Show preview of trigger logic before creation

**On Submit**:
- Call API endpoint: `POST /api/triggers`
- Show success toast
- Refresh triggers list
- Close modal

---

**2b. Edit Trigger Modal**

**Location**: Triggers page → "Edit" icon on each trigger card

**Same fields as Create**, but pre-populated with current values

**Additional Options**:
- Pause/Resume trigger (toggle)
- Reset trigger (if already fired)
- Delete trigger (with confirmation)

---

**2c. Settings Page** ⚙️

**Location**: Settings link in sidebar (currently inactive)

**Sections**:

**Portfolio Configuration**:
- Target allocation sliders (ETH: 60%, USDC: 40%)
- Rebalance threshold (5% drift)
- Asset addresses (for EVM tokens)

**Scheduler Settings**:
- Rebalance schedule (cron expression OR user-friendly picker)
  - Example: "Every Sunday at 10:00 AM" → `0 10 * * 0`
- Trigger check frequency (default: 5 minutes)
- Health check schedule (default: daily at midnight)

**API Keys & Configuration**:
- Warden RPC endpoint
- EVM RPC endpoint (Sepolia/Mainnet)
- OpenAI API key (for chat)
- DEX router addresses

**Advanced Settings**:
- Slippage tolerance (default: 1%)
- Gas price limits
- Transaction timeout
- Enable/disable notifications

**Example UI**:
```
┌─────────────────────────────────────┐
│  Portfolio Configuration            │
├─────────────────────────────────────┤
│  Target Allocation:                 │
│  ETH:  ▓▓▓▓▓▓░░░░ 60%              │
│  USDC: ▓▓▓▓░░░░░░ 40%              │
│                                     │
│  Rebalance Threshold: [5] %         │
│                                     │
│  [Save Changes]                     │
└─────────────────────────────────────┘
```

---

**2d. Manual Execution Buttons**

**Location**: Multiple pages

**Portfolio Page**:
- "Rebalance Now" button (force immediate rebalance)
- Confirmation modal with preview of expected swaps

**Triggers Page**:
- "Test Trigger" button (dry-run evaluation)
- "Execute Now" button (manual trigger without threshold)

**Scheduler Page**:
- "Run Job Now" button for each job
- "Pause/Resume" toggle for each job

---

### **3. API Backend** 🔌

**Tech Stack**:
- Framework: Express.js OR Next.js API Routes (your choice)
- Agent Integration: Import from `src/agent/recurring-executor.ts`
- Authentication: Optional (JWT or API key for production)

**Required Endpoints**:

#### **Triggers API**

```typescript
// GET /api/triggers - List all triggers
GET /api/triggers
Response: {
  triggers: [
    {
      id: "sol-pump-sell",
      currencyPair: "SOL/USD",
      baselinePrice: 200,
      currentPrice: 215,
      thresholdPercentage: 15,
      actionPercentage: 10,
      direction: "above",
      isActive: true,
      progress: 50, // % to threshold
      lastChecked: "2025-11-15T14:00:00Z"
    }
  ]
}

// POST /api/triggers - Create new trigger
POST /api/triggers
Body: {
  currencyPair: "SOL/USD",
  baselinePrice: 215,
  thresholdPercentage: 20,
  actionPercentage: 15,
  direction: "above"
}
Response: { success: true, triggerId: "sol-pump-sell-2" }

// PATCH /api/triggers/:id - Update trigger
PATCH /api/triggers/sol-pump-sell
Body: { thresholdPercentage: 25 }
Response: { success: true }

// DELETE /api/triggers/:id - Delete trigger
DELETE /api/triggers/sol-pump-sell
Response: { success: true }

// POST /api/triggers/:id/pause - Pause trigger
POST /api/triggers/sol-pump-sell/pause
Response: { success: true }

// POST /api/triggers/:id/reset - Reset trigger
POST /api/triggers/sol-pump-sell/reset
Response: { success: true }
```

#### **Scheduler API**

```typescript
// GET /api/scheduler/jobs - List all jobs
GET /api/scheduler/jobs
Response: {
  jobs: [
    {
      id: "rebalance-portfolio",
      name: "Weekly Portfolio Rebalance",
      schedule: "0 10 * * 0",
      enabled: true,
      lastRun: "2025-11-14T10:00:00Z",
      nextRun: "2025-11-21T10:00:00Z",
      successRate: 98.5,
      totalRuns: 67
    }
  ]
}

// POST /api/scheduler/jobs/:id/run - Execute job now
POST /api/scheduler/jobs/rebalance-portfolio/run
Response: { success: true, jobId: "run-12345" }

// PATCH /api/scheduler/jobs/:id - Update job schedule
PATCH /api/scheduler/jobs/rebalance-portfolio
Body: { schedule: "0 14 * * 0" } // Change to 2 PM
Response: { success: true }

// POST /api/scheduler/jobs/:id/pause - Pause job
POST /api/scheduler/jobs/rebalance-portfolio/pause
Response: { success: true }

// POST /api/scheduler/jobs/:id/resume - Resume job
POST /api/scheduler/jobs/rebalance-portfolio/resume
Response: { success: true }
```

#### **Portfolio API**

```typescript
// GET /api/portfolio - Get current portfolio state
GET /api/portfolio
Response: {
  totalValue: 50000,
  assets: [
    { symbol: "ETH", balance: 8.57, value: 30000, allocation: 0.60 },
    { symbol: "USDC", balance: 20000, value: 20000, allocation: 0.40 }
  ],
  drift: 0.5,
  targetAllocation: { ETH: 0.60, USDC: 0.40 }
}

// POST /api/portfolio/rebalance - Trigger rebalance
POST /api/portfolio/rebalance
Response: {
  success: true,
  swaps: [
    { from: "USDC", to: "ETH", amount: 2500 }
  ],
  txHash: "0xabc..."
}

// PATCH /api/portfolio/config - Update portfolio config
PATCH /api/portfolio/config
Body: {
  targetAllocation: { ETH: 0.70, USDC: 0.30 },
  rebalanceThreshold: 0.10
}
Response: { success: true }
```

#### **Chat API**

```typescript
// POST /api/chat - Send message to agent
POST /api/chat
Body: {
  message: "Create a trigger to sell 10% SOL if it pumps 20%",
  sessionId: "user-123" // Optional
}
Response (Streaming via SSE):
data: {"type": "token", "content": "Creating"}
data: {"type": "token", "content": " SOL"}
data: {"type": "token", "content": " trigger..."}
data: {"type": "action", "action": "create_trigger", "params": {...}}
data: {"type": "complete", "content": "✅ Created SOL trigger"}

// Alternative: WebSocket endpoint
WS /api/chat/ws
Send: { message: "..." }
Receive: { type: "response", content: "..." }
```

#### **Activity API**

```typescript
// GET /api/activity - Get activity log
GET /api/activity?limit=50&offset=0&type=swap&status=success
Response: {
  activities: [
    {
      id: "act-123",
      timestamp: "2025-11-15T11:55:00Z",
      type: "trigger",
      action: "Price Trigger Check",
      status: "success",
      duration: 2100, // ms
      details: "SOL checked: 7.5% from threshold",
      txHash: "0x1234..."
    }
  ],
  total: 145
}
```

---

### **4. Real-Time Updates** 🔄

**Option A: Server-Sent Events (SSE)** (Recommended)

```typescript
// GET /api/events - SSE endpoint
GET /api/events
Response (stream):
event: portfolio
data: {"totalValue": 50250, "change": +250}

event: trigger
data: {"id": "sol-pump-sell", "progress": 52}

event: activity
data: {"type": "swap", "action": "Executed", "txHash": "0x..."}
```

**Frontend Implementation**:
```typescript
const eventSource = new EventSource('/api/events');

eventSource.addEventListener('portfolio', (e) => {
  const data = JSON.parse(e.data);
  updatePortfolioUI(data);
});

eventSource.addEventListener('trigger', (e) => {
  const data = JSON.parse(e.data);
  updateTriggerProgress(data);
});
```

**Option B: WebSocket** (Alternative)

```typescript
// WS /api/ws - WebSocket endpoint
const ws = new WebSocket('ws://localhost:3000/api/ws');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  if (event.type === 'portfolio') {
    updatePortfolioUI(event.data);
  }
});
```

**What to Stream**:
- Portfolio value updates (every 30s)
- Trigger progress updates (when prices change)
- Job execution status (when jobs run)
- New activity entries (real-time)
- Agent status changes (running/stopped/error)

---

### **5. Agent Integration** 🤖

**Backend Service Structure**:

```typescript
// src/api/agent-service.ts

import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { PriceTrigger } from '../triggers/price-trigger';
import { CronScheduler } from '../scheduler/cron-scheduler';
import { PortfolioRebalancer } from '../strategies/rebalancer';

export class AgentService {
  private agentkit: WardenAgentKit;
  private priceTrigger: PriceTrigger;
  private scheduler: CronScheduler;
  private rebalancer: PortfolioRebalancer;

  constructor() {
    // Initialize all agent components
    this.agentkit = new WardenAgentKit({ ... });
    this.priceTrigger = new PriceTrigger(...);
    this.scheduler = new CronScheduler();
    this.rebalancer = new PortfolioRebalancer(...);
  }

  // Trigger Management
  async createTrigger(config: TriggerConfig): Promise<string> {
    this.priceTrigger.defineTrigger(config);
    return config.id;
  }

  async updateTrigger(id: string, updates: Partial<TriggerConfig>): Promise<void> {
    const trigger = this.priceTrigger.getTriggerConfig(id);
    if (!trigger) throw new Error('Trigger not found');

    // Update trigger logic here
    this.priceTrigger.defineTrigger({ ...trigger, ...updates });
  }

  async deleteTrigger(id: string): Promise<void> {
    this.priceTrigger.deactivateTrigger(id);
    // Remove from storage
  }

  // Scheduler Management
  async pauseJob(jobId: string): Promise<void> {
    this.scheduler.stopJob(jobId);
  }

  async resumeJob(jobId: string): Promise<void> {
    this.scheduler.startJob(jobId);
  }

  async executeJobNow(jobId: string): Promise<void> {
    const job = this.scheduler.getJobConfig(jobId);
    if (!job) throw new Error('Job not found');

    // Execute job task immediately
    await job.task();
  }

  // Portfolio Management
  async rebalanceNow(): Promise<{ success: boolean; txHash?: string }> {
    const result = await this.rebalancer.rebalancePortfolio();
    return { success: result, txHash: '0x...' };
  }

  async getPortfolioSnapshot() {
    return await this.rebalancer.getPortfolioSnapshot();
  }
}

// Singleton instance
export const agentService = new AgentService();
```

**API Route Implementation** (Next.js example):

```typescript
// pages/api/triggers/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { agentService } from '../../../src/api/agent-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List all triggers
    const triggers = agentService.priceTrigger.getAllTriggers();
    return res.status(200).json({ triggers });
  }

  if (req.method === 'POST') {
    // Create new trigger
    const config = req.body;
    const triggerId = await agentService.createTrigger(config);
    return res.status(201).json({ success: true, triggerId });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// pages/api/triggers/[id].ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    await agentService.updateTrigger(id as string, req.body);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    await agentService.deleteTrigger(id as string);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

### **6. Chat Agent Implementation** 💬

**LangChain Integration**:

```typescript
// src/api/chat-agent.ts

import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { agentService } from './agent-service';

// Define tools for the chat agent
class CreateTriggerTool extends StructuredTool {
  name = 'create_trigger';
  description = 'Create a new price trigger for an asset';
  schema = z.object({
    currencyPair: z.string().describe('Currency pair like SOL/USD'),
    thresholdPercentage: z.number().describe('Threshold percentage'),
    actionPercentage: z.number().describe('Percentage to sell/buy'),
    direction: z.enum(['above', 'below']).describe('Trigger direction'),
  });

  async _call(input: z.infer<typeof this.schema>) {
    const triggerId = await agentService.createTrigger({
      id: `trigger-${Date.now()}`,
      currencyPair: input.currencyPair,
      baselinePrice: 0, // Get current price
      thresholdPercentage: input.thresholdPercentage,
      actionPercentage: input.actionPercentage,
      direction: input.direction,
      isActive: true,
      lastTriggeredAt: 0,
    });
    return `Created trigger ${triggerId} successfully!`;
  }
}

class UpdateTriggerTool extends StructuredTool {
  name = 'update_trigger';
  description = 'Update an existing price trigger';
  schema = z.object({
    triggerId: z.string(),
    thresholdPercentage: z.number().optional(),
    actionPercentage: z.number().optional(),
  });

  async _call(input: z.infer<typeof this.schema>) {
    await agentService.updateTrigger(input.triggerId, {
      thresholdPercentage: input.thresholdPercentage,
      actionPercentage: input.actionPercentage,
    });
    return `Updated trigger ${input.triggerId} successfully!`;
  }
}

class PauseJobTool extends StructuredTool {
  name = 'pause_job';
  description = 'Pause a scheduled job';
  schema = z.object({
    jobId: z.string(),
  });

  async _call(input: z.infer<typeof this.schema>) {
    await agentService.pauseJob(input.jobId);
    return `Paused job ${input.jobId} successfully!`;
  }
}

class GetPortfolioTool extends StructuredTool {
  name = 'get_portfolio';
  description = 'Get current portfolio status';
  schema = z.object({});

  async _call() {
    const snapshot = await agentService.getPortfolioSnapshot();
    return JSON.stringify(snapshot, null, 2);
  }
}

// Create the chat agent
export class ChatAgent {
  private agent: any;

  constructor() {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      streaming: true,
    });

    const tools = [
      new CreateTriggerTool(),
      new UpdateTriggerTool(),
      new PauseJobTool(),
      new GetPortfolioTool(),
      // Add more tools as needed
    ];

    this.agent = createReactAgent({
      llm,
      tools,
      messageModifier: `You are a helpful DeFi portfolio management assistant.
      You can help users create and manage price triggers, configure portfolio rebalancing,
      and monitor their crypto assets. Be concise and confirm actions clearly.`,
    });
  }

  async chat(message: string, onToken?: (token: string) => void) {
    const stream = await this.agent.stream({
      messages: [{ role: 'user', content: message }],
    });

    let finalResponse = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        const content = chunk.agent.messages[0].content;
        finalResponse = content;
        if (onToken) onToken(content);
      }
    }

    return finalResponse;
  }
}

export const chatAgent = new ChatAgent();
```

**Chat API Endpoint** (SSE):

```typescript
// pages/api/chat.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { chatAgent } from '../../src/api/chat-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await chatAgent.chat(message, (token) => {
      res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
}
```

---

## **🎨 UI Component Specifications**

### **Chat Widget Component**

```typescript
// components/ChatWidget.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Maximize2 } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Stream agent response
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let agentMessage = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') {
            agentMessage += data.content;
            // Update last message in real-time
            setMessages((prev) => {
              const newMessages = [...prev];
              if (newMessages[newMessages.length - 1]?.role === 'agent') {
                newMessages[newMessages.length - 1].content = agentMessage;
              } else {
                newMessages.push({ role: 'agent', content: agentMessage, timestamp: new Date() });
              }
              return newMessages;
            });
          }
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        >
          💬 Chat with Agent
        </button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-white font-semibold">Agent Chat</h3>
            <button onClick={() => setIsOpen(false)}>
              <Minimize2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### **Create Trigger Modal Component**

```typescript
// components/CreateTriggerModal.tsx

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTriggerModal({ isOpen, onClose, onSuccess }: CreateTriggerModalProps) {
  const [formData, setFormData] = useState({
    currencyPair: 'SOL/USD',
    thresholdPercentage: 15,
    actionPercentage: 10,
    direction: 'above' as 'above' | 'below',
  });

  const handleSubmit = async () => {
    const response = await fetch('/api/triggers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Create Price Trigger</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Currency Pair</label>
            <select
              value={formData.currencyPair}
              onChange={(e) => setFormData({ ...formData, currencyPair: e.target.value })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
            >
              <option>SOL/USD</option>
              <option>ETH/USD</option>
              <option>BTC/USD</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Threshold (%)</label>
            <input
              type="number"
              value={formData.thresholdPercentage}
              onChange={(e) => setFormData({ ...formData, thresholdPercentage: Number(e.target.value) })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Direction</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.direction === 'above'}
                  onChange={() => setFormData({ ...formData, direction: 'above' })}
                />
                <span className="text-white">Above (Pump)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.direction === 'below'}
                  onChange={() => setFormData({ ...formData, direction: 'below' })}
                />
                <span className="text-white">Below (Dump)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Action: Sell/Buy (%)</label>
            <input
              type="number"
              value={formData.actionPercentage}
              onChange={(e) => setFormData({ ...formData, actionPercentage: Number(e.target.value) })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
            >
              Create Trigger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## **📋 Implementation Checklist**

### **Phase 1: API Backend** (Day 1)
- [ ] Set up API routes (Express or Next.js API)
- [ ] Create `AgentService` class
- [ ] Implement trigger endpoints (GET, POST, PATCH, DELETE)
- [ ] Implement scheduler endpoints
- [ ] Implement portfolio endpoints
- [ ] Test all endpoints with Postman/Thunder Client

### **Phase 2: Chat Interface** (Day 1-2)
- [ ] Create `ChatAgent` class with LangChain
- [ ] Define agent tools (create trigger, update trigger, etc.)
- [ ] Implement chat API endpoint (SSE or WebSocket)
- [ ] Build `ChatWidget` component
- [ ] Add streaming response support
- [ ] Test chat functionality

### **Phase 3: Interactive Forms** (Day 2)
- [ ] Build `CreateTriggerModal` component
- [ ] Build `EditTriggerModal` component
- [ ] Add "Create Trigger" button to Triggers page
- [ ] Add "Edit" buttons to existing triggers
- [ ] Implement form validation
- [ ] Add success/error toasts

### **Phase 4: Settings Page** (Day 2-3)
- [ ] Create Settings page component
- [ ] Add portfolio configuration section
- [ ] Add scheduler settings section
- [ ] Add API keys configuration
- [ ] Implement save functionality
- [ ] Test all settings

### **Phase 5: Manual Execution** (Day 3)
- [ ] Add "Rebalance Now" button to Portfolio page
- [ ] Add "Run Job Now" buttons to Scheduler page
- [ ] Add "Pause/Resume" toggles
- [ ] Implement confirmation modals
- [ ] Test manual executions

### **Phase 6: Real-Time Updates** (Day 3-4)
- [ ] Implement SSE endpoint `/api/events`
- [ ] Add event listeners to frontend
- [ ] Update portfolio values in real-time
- [ ] Update trigger progress in real-time
- [ ] Stream new activity entries
- [ ] Test real-time updates

### **Phase 7: Polish & Testing** (Day 4)
- [ ] Add loading states everywhere
- [ ] Add error handling
- [ ] Test all user flows
- [ ] Fix any bugs
- [ ] Add success/error notifications
- [ ] Test on different browsers

---

## **🎯 Success Criteria**

### **Functional Requirements** ✅
- [ ] Users can create new triggers via chat
- [ ] Users can create new triggers via forms
- [ ] Users can edit/delete existing triggers
- [ ] Users can pause/resume scheduled jobs
- [ ] Users can trigger manual rebalances
- [ ] Users can configure portfolio settings
- [ ] Dashboard updates in real-time
- [ ] All API endpoints work correctly

### **UX Requirements** ✅
- [ ] Chat responses are streamed smoothly
- [ ] Forms have proper validation
- [ ] Success/error messages are clear
- [ ] Loading states are shown
- [ ] Modals are intuitive
- [ ] Navigation is seamless

### **Technical Requirements** ✅
- [ ] API is RESTful and consistent
- [ ] Agent service integrates properly
- [ ] Real-time updates work reliably
- [ ] Error handling is robust
- [ ] Code is well-structured
- [ ] No memory leaks in SSE/WebSocket

---

## **🚀 Expected Impact**

### **Before Interactive Features**: 95/100
- Beautiful but read-only

### **After Interactive Features**: **110/100** 🌟
- Complete, functional, production-ready
- Chat interface = innovation points
- Forms = usability points
- Real-time updates = technical excellence
- **GUARANTEED TOP 3 FINISH!** 🏆

---

## **💡 Additional Features** (Bonus)

If you have extra time, add these for **maximum impact**:

1. **Notifications** 🔔
   - Toast notifications for events
   - Browser push notifications
   - Email/SMS alerts (optional)

2. **Advanced Analytics** 📊
   - Profit/loss tracking
   - Win rate calculations
   - Performance metrics

3. **Multi-User Support** 👥
   - User authentication (Privy/RainbowKit)
   - Separate portfolios per user
   - User settings persistence

4. **Mobile App** 📱
   - React Native or PWA
   - Push notifications
   - Mobile-optimized UI

5. **Testing & CI/CD** 🧪
   - Unit tests for API
   - E2E tests with Playwright
   - Automated deployments

---

## **📝 Notes & Tips**

### **Development Tips**

1. **Start with API first** - Get backend working before UI
2. **Test endpoints manually** - Use Postman/Thunder Client
3. **Use TypeScript strictly** - Catch errors early
4. **Keep agent service stateless** - Makes testing easier
5. **Log everything** - Debug issues faster

### **Common Pitfalls to Avoid**

1. ❌ **Don't forget error handling** - Wrap all async calls in try/catch
2. ❌ **Don't hardcode values** - Use environment variables
3. ❌ **Don't skip validation** - Validate all user inputs
4. ❌ **Don't block the main thread** - Use async/await properly
5. ❌ **Don't forget to clean up** - Close SSE/WebSocket connections

### **Performance Considerations**

1. **Debounce input** - Don't hit API on every keystroke
2. **Cache responses** - Avoid redundant API calls
3. **Lazy load modals** - Don't load until opened
4. **Optimize re-renders** - Use React.memo where needed
5. **Throttle updates** - Don't update UI too frequently

---

## **🎬 Demo Script** (After Implementation)

**60-Second Demo**:
1. Show dashboard overview (10s)
2. Open chat, say "Create SOL trigger at 20%" (15s)
3. Show new trigger appearing in real-time (10s)
4. Click "Edit" on trigger, change to 25% (10s)
5. Click "Rebalance Now" on Portfolio page (15s)

**Judges will be BLOWN AWAY!** 🤯

---

## **✅ Final Checklist Before Demo**

- [ ] All API endpoints return proper status codes
- [ ] Chat agent responds correctly to commands
- [ ] Forms validate inputs properly
- [ ] Real-time updates work smoothly
- [ ] No console errors in browser
- [ ] All buttons/links work
- [ ] Loading states are visible
- [ ] Error messages are helpful
- [ ] Success toasts appear
- [ ] Agent is running in background
- [ ] Mock data is replaced with real data
- [ ] Dashboard is deployed (optional: Vercel)

---

<div align="center">

## **🏆 YOU'RE READY TO WIN!** 🏆

With this implementation, you'll have:
- ✅ Beautiful UI (already done)
- ✅ Interactive controls (new)
- ✅ AI-powered chat (impressive!)
- ✅ Real-time updates (technical excellence)
- ✅ Complete documentation (thorough)

**Expected Score**: **110/100** 🌟

**Expected Result**: **1ST PLACE!** 🥇

</div>

---

## **📞 Need Help?**

If you encounter issues:
1. Check console for errors
2. Review API endpoint logs
3. Test agent service separately
4. Verify environment variables
5. Check CORS settings (if separate frontend/backend)

**Good luck! You've got this!** 🚀

