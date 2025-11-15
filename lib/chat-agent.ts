/**
 * Chat Agent - AI-powered agent for natural language control
 * Uses LangChain + OpenAI to process user commands
 */

import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { agentService } from './agent-service';

// Tool schemas
const CreateTriggerSchema = z.object({
  currencyPair: z.string().describe('Currency pair like SOL/USD, ETH/USD, BTC/USD'),
  thresholdPercentage: z.number().min(1).max(100).describe('Price change threshold percentage'),
  actionPercentage: z.number().min(1).max(100).describe('Percentage to sell/buy when triggered'),
  direction: z.enum(['above', 'below']).describe('Trigger when price goes above or below'),
});

const UpdateTriggerSchema = z.object({
  triggerId: z.string().describe('ID of the trigger to update'),
  thresholdPercentage: z.number().min(1).max(100).optional().describe('New threshold percentage'),
  actionPercentage: z.number().min(1).max(100).optional().describe('New action percentage'),
});

const PauseJobSchema = z.object({
  jobId: z.string().describe('ID of the job to pause'),
});

const ResumeJobSchema = z.object({
  jobId: z.string().describe('ID of the job to resume'),
});

const GetPortfolioSchema = z.object({});

// Create tools
const createTriggerTool = new DynamicStructuredTool({
  name: 'create_trigger',
  description: 'Create a new price trigger for automatic trading when price thresholds are met',
  schema: CreateTriggerSchema,
  func: async ({ currencyPair, thresholdPercentage, actionPercentage, direction }) => {
    try {
      const triggerId = await agentService.createTrigger({
        currencyPair,
        baselinePrice: 200, // Will be set to current price
        thresholdPercentage,
        actionPercentage,
        direction,
        isActive: true,
      });

      return `✅ Successfully created ${currencyPair} trigger!
- Trigger ID: ${triggerId}
- Will ${direction === 'above' ? 'sell' : 'buy'} ${actionPercentage}% when price moves ${thresholdPercentage}% ${direction} baseline
- Trigger is now active and monitoring`;
    } catch (error: any) {
      return `❌ Failed to create trigger: ${error.message}`;
    }
  },
});

const updateTriggerTool = new DynamicStructuredTool({
  name: 'update_trigger',
  description: 'Update an existing price trigger configuration',
  schema: UpdateTriggerSchema,
  func: async ({ triggerId, thresholdPercentage, actionPercentage }) => {
    try {
      await agentService.updateTrigger(triggerId, {
        thresholdPercentage,
        actionPercentage,
      });

      return `✅ Successfully updated trigger ${triggerId}!
${thresholdPercentage ? `- New threshold: ${thresholdPercentage}%\n` : ''}${actionPercentage ? `- New action: ${actionPercentage}%` : ''}`;
    } catch (error: any) {
      return `❌ Failed to update trigger: ${error.message}`;
    }
  },
});

const pauseJobTool = new DynamicStructuredTool({
  name: 'pause_job',
  description: 'Pause a scheduled job to stop it from running',
  schema: PauseJobSchema,
  func: async ({ jobId }) => {
    try {
      await agentService.pauseJob(jobId);
      return `✅ Successfully paused job: ${jobId}`;
    } catch (error: any) {
      return `❌ Failed to pause job: ${error.message}`;
    }
  },
});

const resumeJobTool = new DynamicStructuredTool({
  name: 'resume_job',
  description: 'Resume a paused scheduled job',
  schema: ResumeJobSchema,
  func: async ({ jobId }) => {
    try {
      await agentService.resumeJob(jobId);
      return `✅ Successfully resumed job: ${jobId}`;
    } catch (error: any) {
      return `❌ Failed to resume job: ${error.message}`;
    }
  },
});

const getPortfolioTool = new DynamicStructuredTool({
  name: 'get_portfolio',
  description: 'Get current portfolio status including assets, values, and allocations',
  schema: GetPortfolioSchema,
  func: async () => {
    try {
      const snapshot = await agentService.getPortfolioSnapshot();

      let response = `📊 **Current Portfolio**\n\n`;
      response += `Total Value: $${snapshot.totalValue.toLocaleString()}\n\n`;
      response += `**Assets:**\n`;

      for (const asset of snapshot.assets) {
        response += `- ${asset.symbol}: ${asset.balance.toLocaleString()} ($${asset.value.toLocaleString()}) - ${(asset.allocation * 100).toFixed(1)}%\n`;
      }

      response += `\nDrift from target: ${snapshot.drift.toFixed(2)}%`;

      return response;
    } catch (error: any) {
      return `❌ Failed to get portfolio: ${error.message}`;
    }
  },
});

const getTriggersTool = new DynamicStructuredTool({
  name: 'get_triggers',
  description: 'List all active price triggers',
  schema: z.object({}),
  func: async () => {
    try {
      const triggers = await agentService.getTriggers();

      if (triggers.length === 0) {
        return 'No active triggers found.';
      }

      let response = `🎯 **Active Triggers (${triggers.length})**\n\n`;

      for (const trigger of triggers) {
        response += `**${trigger.id}**\n`;
        response += `- Pair: ${trigger.currencyPair}\n`;
        response += `- Threshold: ${trigger.thresholdPercentage}% ${trigger.direction}\n`;
        response += `- Action: ${trigger.direction === 'above' ? 'Sell' : 'Buy'} ${trigger.actionPercentage}%\n`;
        response += `- Status: ${trigger.isActive ? '🟢 Active' : '🔴 Paused'}\n\n`;
      }

      return response;
    } catch (error: any) {
      return `❌ Failed to get triggers: ${error.message}`;
    }
  },
});

/**
 * ChatAgent - Manages AI-powered chat interactions
 */
export class ChatAgent {
  private llm: ChatOpenAI;
  private tools: DynamicStructuredTool[];

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      streaming: true,
      openAIApiKey: apiKey,
    });

    this.tools = [
      createTriggerTool,
      updateTriggerTool,
      pauseJobTool,
      resumeJobTool,
      getPortfolioTool,
      getTriggersTool,
    ];
  }

  async chat(message: string): Promise<string> {
    try {
      const systemPrompt = `You are a helpful DeFi portfolio management assistant for the Recurring Executor Agent dashboard.

You can help users:
- Create and manage price triggers for automatic trading
- Monitor and control scheduled jobs (rebalancing, health checks)
- View portfolio status and asset allocations
- Configure portfolio settings

Available tools:
- create_trigger: Create new price triggers
- update_trigger: Modify existing triggers
- pause_job/resume_job: Control scheduled jobs
- get_portfolio: View portfolio status
- get_triggers: List all triggers

Be concise, friendly, and confirm actions clearly. Use emojis to make responses more engaging.
When users ask about triggers or portfolio, use the appropriate tools to get current data.`;

      // For now, use a simple completion without agent loop
      // In production, you'd use createReactAgent or similar for tool calling
      const response = await this.llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ]);

      return response.content as string;
    } catch (error: any) {
      console.error('Chat error:', error);
      return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
  }

  async *chatStream(message: string): AsyncGenerator<string> {
    try {
      const systemPrompt = `You are a helpful DeFi portfolio management assistant. Be concise and use emojis.`;

      const stream = await this.llm.stream([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ]);

      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content as string;
        }
      }
    } catch (error: any) {
      console.error('Chat stream error:', error);
      yield `Sorry, I encountered an error: ${error.message}`;
    }
  }
}

// Singleton instance
let chatAgentInstance: ChatAgent | null = null;

export function getChatAgent(): ChatAgent {
  if (!chatAgentInstance) {
    chatAgentInstance = new ChatAgent();
  }
  return chatAgentInstance;
}

