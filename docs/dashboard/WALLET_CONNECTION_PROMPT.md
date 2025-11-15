# 🔐 **Agent Prompt: Wallet Connection & User Onboarding**
## **Add Multi-User Support to Recurring Executor Dashboard**

---

## **🎯 Mission**

Transform the **single-user demo** into a **multi-user production app** by adding wallet connection, real balance reading, and user-specific agent instances - **WITHOUT breaking the existing beautiful dashboard**.

---

## **📋 Context: What Already Exists**

You have a **fully functional system** with:

### **✅ Existing Dashboard** (localhost:3000)
- **5 beautiful pages**: Overview, Portfolio, Triggers, Scheduler, Activity
- **Professional UI**: Dark theme, charts, tables
- **Current data**: Mock/demo data (not connected to real wallets)
- **Score**: 95/100 (excellent but read-only)
- **Tech**: Next.js, React, TypeScript

### **✅ Existing Backend Agent**
- **Location**: `src/agent/`, `src/executor/`, `src/oracle/`, etc.
- **Functionality**:
  - Price fetching from Warden x/oracle ✅
  - Swap execution ✅
  - Portfolio rebalancing ✅
  - Cron scheduling ✅
  - Price triggers ✅
- **Current limitation**: Uses ONE private key from `.env` file

### **✅ Documentation**
- `USER_ONBOARDING.md` - Complete explanation of the problem
- `DASHBOARD_INTERACTIVE_PROMPT.md` - Guide for interactive features
- `docs/` folder - Technical deep dives

---

## **🚨 The Problem**

**Current Flow** (Single User):
```
.env file → PRIVATE_KEY → Agent → Operates on ONE wallet
Dashboard → Shows mock data → Not connected to real wallet
```

**Target Flow** (Multi User):
```
User connects wallet → Dashboard reads REAL balance → Agent operates per user
Each user has their own portfolio, triggers, schedules
```

---

## **🎯 Your Goal: Implement TWO Solutions**

Build **both** approaches so the team can choose:

### **Solution 1: Wallet Connect** (Standard Web3)
- Users connect with MetaMask/WalletConnect
- Agent prepares transactions, user signs each one
- Industry standard, non-custodial

### **Solution 2: Warden Spaces** (Warden-Native)
- Users create on-chain Space
- Agent auto-executes with permissions
- Impressive for Warden hackathon

---

## **📦 Solution 1: Wallet Connect Integration**

### **1.1 Dependencies**

Install these packages:

```bash
# Wallet connection libraries
bun add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query

# Warden-specific (if not already installed)
bun add @wardenprotocol/warden-agent-kit-core
```

### **1.2 Configuration**

**Step 1**: Get WalletConnect Project ID
- Visit: https://cloud.walletconnect.com/sign-in
- Create free project
- Copy Project ID

**Step 2**: Update `.env`

```bash
# Add to .env (create if doesn't exist)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Keep existing keys
OPENAI_API_KEY=sk-...
PRIVATE_KEY=0x...  # Agent's key for orchestration
```

### **1.3 Provider Setup**

**Create**: `app/providers.tsx`

```typescript
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, polygon], // Add chains as needed
  [publicProvider()]
);

// Configure wallets
const { connectors } = getDefaultWallets({
  appName: 'Recurring Executor Agent',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains,
});

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// Create React Query client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
```

**Update**: `app/layout.tsx`

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### **1.4 Wallet Connection UI**

**Update**: Existing sidebar/header component

Find where the header/sidebar is rendered and add:

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function Header() {
  const { address, isConnected } = useAccount();

  return (
    <header className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-semibold">
          Recurring Executor Agent
        </h1>

        {/* Add wallet connection button */}
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="text-gray-400 text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
          />
        </div>
      </div>
    </header>
  );
}
```

**Styling Note**: RainbowKit has default styles, but you can customize:

```typescript
<RainbowKitProvider
  chains={chains}
  theme={darkTheme({
    accentColor: '#3b82f6', // Match your blue theme
    accentColorForeground: 'white',
    borderRadius: 'medium',
  })}
>
```

### **1.5 Read Real Balances**

**Update**: `app/portfolio/page.tsx` (or wherever portfolio is displayed)

```typescript
'use client';

import { useAccount, useBalance, useContractRead } from 'wagmi';
import { formatEther, formatUnits } from 'viem';

// ERC20 ABI for reading balance
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Token addresses (update with correct addresses for your network)
const TOKENS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  // Add more tokens as needed
};

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

  // Get ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    watch: true, // Real-time updates
  });

  // Get USDC balance
  const { data: usdcBalance, isLoading: usdcLoading } = useContractRead({
    address: TOKENS.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    watch: true,
  });

  // Get prices from your oracle
  const { data: prices } = usePrices(['ETH/USD', 'USDC/USD']);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your portfolio
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (ethLoading || usdcLoading) {
    return <div>Loading portfolio...</div>;
  }

  // Calculate values
  const ethValue = ethBalance
    ? parseFloat(formatEther(ethBalance.value)) * (prices?.['ETH/USD'] || 0)
    : 0;

  const usdcValue = usdcBalance
    ? parseFloat(formatUnits(usdcBalance, 6)) * (prices?.['USDC/USD'] || 1)
    : 0;

  const totalValue = ethValue + usdcValue;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Portfolio</h1>

      {/* Total Value Card */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="text-gray-400 text-sm mb-2">Total Portfolio Value</div>
        <div className="text-4xl font-bold text-white">
          ${totalValue.toFixed(2)}
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* ETH Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-semibold">ETH</div>
            <div className="text-blue-500">{((ethValue / totalValue) * 100).toFixed(1)}%</div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : '0.0000'}
          </div>
          <div className="text-gray-400 text-sm">
            ${ethValue.toFixed(2)}
          </div>
        </div>

        {/* USDC Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-semibold">USDC</div>
            <div className="text-green-500">{((usdcValue / totalValue) * 100).toFixed(1)}%</div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2) : '0.00'}
          </div>
          <div className="text-gray-400 text-sm">
            ${usdcValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Keep existing charts and tables, update data sources */}
    </div>
  );
}
```

### **1.6 Custom Hook for Prices**

**Create**: `hooks/usePrices.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function usePrices(pairs: string[]) {
  return useQuery({
    queryKey: ['prices', pairs],
    queryFn: async () => {
      // Call your backend API that uses Warden oracle
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs }),
      });

      if (!response.ok) throw new Error('Failed to fetch prices');

      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
```

**Create**: `app/api/prices/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { PriceFetcher } from '../../../src/oracle/price-fetcher';

export async function POST(request: Request) {
  try {
    const { pairs } = await request.json();

    // Initialize agent kit with server-side key
    const agentkit = new WardenAgentKit({
      privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    const priceFetcher = new PriceFetcher(agentkit);
    const prices: Record<string, number> = {};

    // Fetch all prices
    for (const pair of pairs) {
      prices[pair] = await priceFetcher.getPrice(pair);
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
```

### **1.7 User-Specific Agent Instances**

**Create**: `lib/agent-manager.ts`

```typescript
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { PriceTrigger } from '../src/triggers/price-trigger';
import { CronScheduler } from '../src/scheduler/cron-scheduler';

interface UserAgentConfig {
  userAddress: string;
  triggers: TriggerConfig[];
  portfolioConfig: PortfolioConfig;
}

export class AgentManager {
  private userAgents = new Map<string, UserAgent>();

  /**
   * Get or create agent instance for user
   */
  getAgentForUser(userAddress: string): UserAgent {
    if (!this.userAgents.has(userAddress)) {
      const agent = new UserAgent(userAddress);
      this.userAgents.set(userAddress, agent);
    }
    return this.userAgents.get(userAddress)!;
  }

  /**
   * Initialize agent for a new user
   */
  async initializeUser(config: UserAgentConfig): Promise<void> {
    const agent = this.getAgentForUser(config.userAddress);
    await agent.initialize(config);
  }
}

class UserAgent {
  private triggers: PriceTrigger[] = [];
  private scheduler: CronScheduler;
  private agentkit: WardenAgentKit;

  constructor(public readonly userAddress: string) {
    // Initialize with orchestration key (not user's key!)
    this.agentkit = new WardenAgentKit({
      privateKeyOrAccount: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
    });
    this.scheduler = new CronScheduler();
  }

  async initialize(config: UserAgentConfig): Promise<void> {
    // Set up triggers for this user
    for (const triggerConfig of config.triggers) {
      const trigger = new PriceTrigger({
        ...triggerConfig,
        userAddress: this.userAddress,
      });
      this.triggers.push(trigger);
    }

    // Set up scheduled jobs
    this.scheduler.scheduleJob({
      id: `rebalance-${this.userAddress}`,
      schedule: config.portfolioConfig.rebalanceSchedule,
      action: async () => {
        await this.rebalancePortfolio(config.portfolioConfig);
      },
    });
  }

  async rebalancePortfolio(config: PortfolioConfig): Promise<void> {
    // Prepare rebalance transaction
    // User will sign via their wallet
    console.log(`Preparing rebalance for ${this.userAddress}`);
  }

  getTriggers(): PriceTrigger[] {
    return this.triggers;
  }
}

// Singleton instance
export const agentManager = new AgentManager();
```

### **1.8 Transaction Execution Flow**

**Create**: `app/api/agent/rebalance/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { agentManager } from '../../../../lib/agent-manager';

export async function POST(request: Request) {
  try {
    const { userAddress } = await request.json();

    // Get user's agent instance
    const agent = agentManager.getAgentForUser(userAddress);

    // Prepare rebalance transactions
    const transactions = await agent.prepareRebalance();

    // Return transactions for user to sign
    return NextResponse.json({
      transactions,
      message: 'Please sign these transactions in your wallet',
    });
  } catch (error) {
    console.error('Error preparing rebalance:', error);
    return NextResponse.json(
      { error: 'Failed to prepare rebalance' },
      { status: 500 }
    );
  }
}
```

**Frontend Component**: `components/RebalanceButton.tsx`

```typescript
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useState } from 'react';

export function RebalanceButton() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleRebalance = async () => {
    // Call API to prepare transactions
    const response = await fetch('/api/agent/rebalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress: address }),
    });

    const { transactions } = await response.json();
    setTransactions(transactions);

    // Execute each transaction (user signs in wallet)
    for (const tx of transactions) {
      // Use wagmi to send transaction
      // User will see MetaMask popup for each tx
    }
  };

  return (
    <button
      onClick={handleRebalance}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
    >
      Rebalance Portfolio
    </button>
  );
}
```

---

## **📦 Solution 2: Warden Spaces Integration**

### **2.1 Overview**

Warden Spaces are **on-chain smart accounts** that allow:
- Permission-based execution (agent can auto-execute)
- On-chain audit trail
- Multi-signature support
- Rules engine (x/act module)

### **2.2 Space Creation Flow**

**User Flow**:
```
1. User connects wallet
2. User clicks "Create Agent Space"
3. Agent creates Space on Warden chain
4. User deposits funds to Space address
5. Agent can now auto-execute on behalf of user
```

### **2.3 Implementation**

**Create**: `lib/warden-spaces.ts`

```typescript
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';

export class WardenSpaceManager {
  private agentkit: WardenAgentKit;

  constructor() {
    this.agentkit = new WardenAgentKit({
      privateKeyOrAccount: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
    });
  }

  /**
   * Create a Space for a user
   */
  async createSpaceForUser(userAddress: string): Promise<Space> {
    console.log(`Creating Space for user: ${userAddress}`);

    const space = await this.agentkit.createSpace({
      name: `RecurringExecutor_${userAddress.slice(0, 8)}`,
      adminIntentId: '1', // Default admin permissions
      signIntentId: '1',  // Default signing permissions
      owners: [userAddress], // User is the owner
    });

    console.log(`✅ Space created: ${space.id}`);
    console.log(`   Address: ${space.address}`);

    return {
      id: space.id,
      address: space.address,
      owner: userAddress,
      createdAt: Date.now(),
    };
  }

  /**
   * Get Space balance
   */
  async getSpaceBalance(spaceId: string): Promise<Balance[]> {
    const balances = await this.agentkit.getSpaceBalances(spaceId);
    return balances;
  }

  /**
   * Execute action on Space (agent has permission)
   */
  async executeOnSpace(
    spaceId: string,
    action: SpaceAction
  ): Promise<string> {
    console.log(`Executing ${action.type} on Space ${spaceId}`);

    const txHash = await this.agentkit.executeOnSpace({
      spaceId,
      action: action.type,
      params: action.params,
    });

    console.log(`✅ Transaction: ${txHash}`);
    return txHash;
  }
}

interface Space {
  id: string;
  address: string;
  owner: string;
  createdAt: number;
}

interface SpaceAction {
  type: 'swap' | 'rebalance' | 'transfer';
  params: any;
}

// Singleton instance
export const spaceManager = new WardenSpaceManager();
```

**API Endpoint**: `app/api/spaces/create/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { spaceManager } from '../../../../lib/warden-spaces';

export async function POST(request: Request) {
  try {
    const { userAddress } = await request.json();

    // Create Space for user
    const space = await spaceManager.createSpaceForUser(userAddress);

    // Store Space info in database (optional)
    // await db.spaces.create({ ...space, userId: userAddress });

    return NextResponse.json({
      success: true,
      space,
      depositInstructions: {
        address: space.address,
        chainId: 'warden-testnet-1',
        message: `Send funds to ${space.address} to start automating!`,
      },
    });
  } catch (error) {
    console.error('Error creating Space:', error);
    return NextResponse.json(
      { error: 'Failed to create Space' },
      { status: 500 }
    );
  }
}
```

**Frontend Component**: `components/CreateSpaceButton.tsx`

```typescript
'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';

export function CreateSpaceButton() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [space, setSpace] = useState<any>(null);

  const createSpace = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
      });

      const data = await response.json();
      setSpace(data.space);

      // Show success message with deposit instructions
      alert(`Space created! Deposit funds to: ${data.space.address}`);
    } catch (error) {
      console.error('Error creating Space:', error);
      alert('Failed to create Space');
    } finally {
      setLoading(false);
    }
  };

  if (space) {
    return (
      <div className="bg-green-900 border border-green-700 rounded-lg p-4">
        <div className="text-green-100 font-semibold mb-2">
          ✅ Space Created!
        </div>
        <div className="text-green-200 text-sm mb-2">
          Space ID: {space.id}
        </div>
        <div className="text-green-200 text-sm">
          Deposit Address: {space.address}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={createSpace}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
    >
      {loading ? 'Creating Space...' : 'Create Agent Space'}
    </button>
  );
}
```

**Space Dashboard**: `app/space/page.tsx`

```typescript
'use client';

import { useAccount } from 'wagmi';
import { CreateSpaceButton } from '../../components/CreateSpaceButton';

export default function SpacePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return <div>Connect wallet to create a Space</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Warden Space Setup
      </h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          What is a Space?
        </h2>
        <ul className="text-gray-300 space-y-2">
          <li>✅ On-chain smart account for your agent</li>
          <li>✅ Agent can auto-execute (no per-tx approval)</li>
          <li>✅ Full audit trail on Warden blockchain</li>
          <li>✅ You remain in control (multi-sig support)</li>
        </ul>
      </div>

      <CreateSpaceButton />

      {/* After Space is created, show balance and activity */}
    </div>
  );
}
```

---

## **🔧 Database Schema** (Optional but Recommended)

If you want to persist user data:

**Create**: `prisma/schema.prisma` (or use your preferred DB)

```prisma
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  createdAt     DateTime  @default(now())
  spaces        Space[]
  triggers      Trigger[]
}

model Space {
  id            String   @id
  address       String   @unique
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
}

model Trigger {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  currencyPair      String
  baselinePrice     Float
  thresholdPercent  Float
  actionPercent     Float
  direction         String
  isActive          Boolean  @default(true)
  lastTriggeredAt   DateTime?
  createdAt         DateTime @default(now())
}
```

---

## **✅ Implementation Checklist**

### **Phase 1: Wallet Connection** (4-6 hours)
- [ ] Install RainbowKit + wagmi dependencies
- [ ] Get WalletConnect Project ID
- [ ] Create `providers.tsx` with RainbowKit setup
- [ ] Wrap app with providers in `layout.tsx`
- [ ] Add ConnectButton to header/sidebar
- [ ] Test connection with MetaMask

### **Phase 2: Real Balance Reading** (4-6 hours)
- [ ] Update Portfolio page to use `useBalance` hook
- [ ] Add ERC20 token balance reading (USDC, etc.)
- [ ] Create `/api/prices` endpoint for oracle
- [ ] Create `usePrices` custom hook
- [ ] Test with connected wallet
- [ ] Handle loading states and errors

### **Phase 3: User-Specific Agents** (6-8 hours)
- [ ] Create `AgentManager` class
- [ ] Create `UserAgent` class per user
- [ ] Update trigger system to be user-specific
- [ ] Update scheduler to be user-specific
- [ ] Create API endpoints for agent actions
- [ ] Test with multiple wallets

### **Phase 4: Warden Spaces** (8-12 hours)
- [ ] Create `WardenSpaceManager` class
- [ ] Create `/api/spaces/create` endpoint
- [ ] Build Space creation UI
- [ ] Add deposit instructions
- [ ] Implement Space balance reading
- [ ] Implement agent execution on Spaces
- [ ] Test full flow

### **Phase 5: Polish & Testing** (4-6 hours)
- [ ] Add loading states everywhere
- [ ] Add error handling
- [ ] Add success/error toasts
- [ ] Test wallet disconnection
- [ ] Test network switching
- [ ] Test with different wallets
- [ ] Update documentation

---

## **🎯 Success Criteria**

When complete, users should be able to:

1. ✅ Connect wallet with MetaMask/WalletConnect
2. ✅ See REAL portfolio balances (not mock data)
3. ✅ Create triggers specific to their wallet
4. ✅ Set up portfolio rebalancing rules
5. ✅ **(Optional)** Create Warden Space for auto-execution
6. ✅ See transaction history for their wallet
7. ✅ Disconnect and reconnect without issues

---

## **⚠️ Important Notes**

### **What NOT to Break**
- ❌ Don't modify existing UI styling
- ❌ Don't change page layouts
- ❌ Don't break existing charts/graphs
- ❌ Don't remove any existing features
- ❌ Don't change color scheme

### **What to Preserve**
- ✅ Keep all existing pages (Overview, Portfolio, Triggers, Scheduler, Activity)
- ✅ Keep dark theme and styling
- ✅ Keep chart visualizations
- ✅ Keep sidebar navigation
- ✅ Keep existing data structures (just change data source)

### **Testing**
Test with these wallets:
- MetaMask (most common)
- WalletConnect (mobile)
- Coinbase Wallet
- Rainbow Wallet

---

## **🐛 Common Issues & Solutions**

### **Issue 1**: "Hydration error" in Next.js
**Solution**: Wrap wallet-dependent components in `'use client'` directive

### **Issue 2**: "Chain not supported"
**Solution**: Add chain to `configureChains` in providers.tsx

### **Issue 3**: "Connector not found"
**Solution**: Check WalletConnect Project ID is set in .env

### **Issue 4**: Balance shows 0
**Solution**: Check network (Mainnet vs Testnet) and token addresses

---

## **📚 Resources**

- RainbowKit Docs: https://www.rainbowkit.com/docs/introduction
- wagmi Docs: https://wagmi.sh/
- viem Docs: https://viem.sh/
- Warden Agent Kit: https://github.com/warden-protocol/agent-kit
- Warden Docs: https://docs.wardenprotocol.org/

---

## **🎬 Demo Script** (After Implementation)

**30-Second Demo**:
```
1. Show dashboard (currently showing mock data)
2. Click "Connect Wallet"
3. Connect MetaMask
4. BOOM - Real portfolio appears! ($X,XXX actual balance)
5. Show trigger creation form
6. Set up "Sell 10% ETH if it pumps 20%"
7. Show it's now monitoring REAL wallet
```

**Judge Impact**: 🌟🌟🌟🌟🌟

---

## **✅ Final Deliverables**

Submit these files:
- [ ] `app/providers.tsx` - Wallet providers
- [ ] Updated `app/layout.tsx` - Wrapped with providers
- [ ] Updated sidebar/header - ConnectButton added
- [ ] Updated `app/portfolio/page.tsx` - Real balance reading
- [ ] `hooks/usePrices.ts` - Price fetching hook
- [ ] `app/api/prices/route.ts` - Oracle API
- [ ] `lib/agent-manager.ts` - User agent management
- [ ] `lib/warden-spaces.ts` - Space management (optional)
- [ ] Updated `.env.example` - New env vars documented
- [ ] `WALLET_CONNECTION.md` - Setup guide for users

---

<div align="center">

## **🚀 Ready to Make This Multi-User!**

**Current**: Single-user demo (excellent!)
**Target**: Multi-user production (UNSTOPPABLE!)

**Time Estimate**:
- Wallet Connect only: 1-2 days
- Wallet Connect + Spaces: 3-4 days

**Score Impact**: 95/100 → **110/100** 🌟

</div>

