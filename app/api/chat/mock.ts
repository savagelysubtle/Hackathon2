/**
 * Mock Responses for Demo Mode
 *
 * This file provides realistic AI-like responses when no OpenAI API key is provided.
 * Enables judges and users to test the full UI/UX without needing their own API key.
 */

export interface MockResponse {
  response: string;
  delay: number; // Simulated API delay in ms
}

export const mockResponses = {
  // Portfolio queries
  portfolio: {
    response: `📊 **Your Portfolio Analysis**

**Current Holdings:**
- ETH: 1.5 ($3,750 @ $2,500/ETH)
- SOL: 10.0 ($950 @ $95/SOL)
- USDC: 2,000 ($2,000)

**Total Portfolio Value:** $6,700

**Target Allocation:**
- 50% ETH (Target: $3,350, Current: $3,750)
- 20% SOL (Target: $1,340, Current: $950)
- 30% USDC (Target: $2,010, Current: $2,000)

**Drift Analysis:**
- ETH: +12% over target (sell ~$400 worth)
- SOL: -29% under target (buy ~$390 worth)
- USDC: On target ✅

**Recommendation:** Portfolio drift detected. Consider rebalancing to maintain target allocations.`,
    delay: 1200,
  },

  // Trigger creation
  trigger: {
    response: `✅ **Trigger Created Successfully!**

**Trigger Details:**
- Asset: SOL
- Condition: Price pumps 20% (from $95 to $114)
- Action: Sell 10% of SOL holdings (~1 SOL)
- Status: Active 🟢

**Current Price:** $95
**Target Price:** $114

I'm now monitoring SOL price every minute. When it hits $114, I'll automatically prepare a sell transaction for your approval.

You can view this trigger in the "Triggers" tab!`,
    delay: 1500,
  },

  // Price queries
  price: {
    response: `💰 **Current Market Prices**

**Major Assets:**
- BTC: $45,000 📈 (+2.3% 24h)
- ETH: $2,500 📈 (+1.8% 24h)
- SOL: $95 📉 (-0.5% 24h)
- USDC: $1.00 (stable)

**Your Holdings:**
- ETH: 1.5 ($3,750)
- SOL: 10.0 ($950)
- USDC: 2,000 ($2,000)

*Prices updated 30 seconds ago via Warden x/oracle*`,
    delay: 800,
  },

  // Rebalancing
  rebalance: {
    response: `🔄 **Rebalancing Analysis**

**Current vs Target Allocation:**

ETH: 56% → 50% (Overweight by 6%)
- Action: Sell $400 worth of ETH

SOL: 14% → 20% (Underweight by 6%)
- Action: Buy $390 worth of SOL

USDC: 30% → 30% (On target ✅)
- Action: None needed

**Recommended Trades:**
1. Sell 0.16 ETH → ~$400 USDC
2. Buy 4.1 SOL with $390 USDC

**Estimated Gas:** ~$5
**Expected Slippage:** <0.5%

Would you like me to prepare these transactions?`,
    delay: 1400,
  },

  // Schedule query
  schedule: {
    response: `📅 **Your Active Schedules**

**1. Daily Rebalancing**
- Frequency: Every day at 9:00 AM UTC
- Action: Check portfolio drift and rebalance if >5%
- Status: Active 🟢
- Next run: Tomorrow at 9:00 AM

**2. Weekly DCA (Dollar Cost Average)**
- Frequency: Every Monday at 12:00 PM UTC
- Action: Buy $100 worth of ETH
- Status: Active 🟢
- Next run: Monday at 12:00 PM

**3. SOL Pump Alert**
- Frequency: Every 5 minutes
- Action: Check if SOL pumped 20%, then sell 10%
- Status: Active 🟢
- Next check: In 3 minutes

Add more schedules in the "Scheduler" tab!`,
    delay: 1000,
  },

  // Spaces query
  spaces: {
    response: `🏦 **Your Warden Spaces**

**Space #1: Main Trading Space**
- Address: warden1abc...xyz
- Balance: $6,700
- Owners: You
- Intents: 3 active
- Status: Active 🟢

**Active Intents:**
1. Daily rebalancing (auto-approved)
2. Stop-loss at -10% (requires approval)
3. DCA weekly (auto-approved)

**What are Spaces?**
Warden Spaces are smart accounts that let me execute trades autonomously. When you approve an intent, I can execute it automatically without asking every time!

Want to create a new Space for a specific strategy?`,
    delay: 1100,
  },

  // Help/default
  default: {
    response: `👋 **Welcome to the Recurring Executor Agent!**

I'm your autonomous trading assistant powered by Warden Protocol. Here's what I can do:

**📊 Portfolio Management**
- "Show my portfolio"
- "Analyze my holdings"
- "What's my portfolio drift?"

**🎯 Triggers & Automation**
- "Create a trigger for SOL"
- "Alert me when ETH hits $3000"
- "Sell 10% if BTC drops 5%"

**💰 Price Monitoring**
- "What's the current price of SOL?"
- "Show me market prices"

**🔄 Rebalancing**
- "Should I rebalance?"
- "Rebalance my portfolio"

**📅 Scheduling**
- "Show my schedules"
- "Create a weekly DCA"

**🏦 Warden Spaces**
- "Show my Spaces"
- "Explain Spaces"

**Demo Mode Active** 🎭
_These are simulated responses. To connect to real AI and execute actual trades, add your OpenAI API key in Settings._

Try asking: "Show my portfolio" or "Create a trigger for SOL"!`,
    delay: 1000,
  },
};

/**
 * Get appropriate mock response based on user message
 */
export function getMockResponse(message: string): MockResponse {
  const lower = message.toLowerCase();

  // Portfolio queries
  if (
    lower.includes('portfolio') ||
    lower.includes('holdings') ||
    lower.includes('balance')
  ) {
    return mockResponses.portfolio;
  }

  // Trigger creation
  if (
    lower.includes('trigger') ||
    lower.includes('alert') ||
    lower.includes('notify')
  ) {
    return mockResponses.trigger;
  }

  // Price queries
  if (
    lower.includes('price') ||
    lower.includes('cost') ||
    lower.includes('market')
  ) {
    return mockResponses.price;
  }

  // Rebalancing
  if (
    lower.includes('rebalance') ||
    lower.includes('drift') ||
    lower.includes('allocation')
  ) {
    return mockResponses.rebalance;
  }

  // Schedule queries
  if (
    lower.includes('schedule') ||
    lower.includes('cron') ||
    lower.includes('recurring') ||
    lower.includes('dca')
  ) {
    return mockResponses.schedule;
  }

  // Spaces queries
  if (lower.includes('space') || lower.includes('intent')) {
    return mockResponses.spaces;
  }

  // Default help
  return mockResponses.default;
}

/**
 * Simulate typing delay for more realistic feel
 */
export async function simulateTypingDelay(text: string): Promise<void> {
  // Simulate ~50 words per minute typing speed
  const words = text.split(' ').length;
  const delay = (words / 50) * 60 * 1000; // Convert to ms
  await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 2000))); // Cap at 2s
}
