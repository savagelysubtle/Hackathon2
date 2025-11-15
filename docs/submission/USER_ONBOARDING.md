# 💰 **User Onboarding & Data Sources**
## **How Users Add Funds & Connect to the Dashboard**

---

## **🎯 TL;DR - Current State**

### **❌ What's MISSING (Critical Gap)**
- **No user onboarding flow**
- **No wallet connection UI**
- **No fund deposit mechanism**
- **Dashboard shows MOCK data only**

### **✅ What's WORKING**
- **Live price data** from Warden x/oracle (Skip:Connect)
- **Agent can read** user's on-chain balances via `agentkit.getAddress()`
- **Agent can execute** swaps and rebalances

---

## **📊 Data Sources Explained**

### **1. Price Data** ✅ **LIVE & WORKING**

**Source**: **Warden Protocol x/oracle** (powered by Skip:Connect)

```typescript
// Live prices from on-chain oracle
const oracle = new PriceFetcher(agentkit);
const solPrice = await oracle.getPrice('SOL/USD'); // Real-time!
```

**How it works**:
- Warden validators fetch prices from multiple sources
- Stake-weighted median calculated every block (~2-5 seconds)
- 2,000+ currency pairs available (crypto, forex, commodities)
- No external API keys needed - it's on-chain!

**Example pairs**:
```
SOL/USD, ETH/USD, BTC/USD, AVAX/USD, LINK/USD, UNI/USD...
```

---

### **2. Portfolio/Balance Data** ⚠️ **PARTIALLY IMPLEMENTED**

**Current Implementation**:

The agent can **read balances** from the user's wallet:

```typescript
// In src/strategies/rebalancer.ts
async getCurrentHoldings(): Promise<Record<string, number>> {
    const address = this.agentkit.getAddress();

    // Query balances for each asset
    const ethBalance = await provider.getBalance(address);
    const usdcBalance = await usdcContract.balanceOf(address);

    return {
        ETH: parseFloat(ethers.formatEther(ethBalance)),
        USDC: parseFloat(ethers.formatUnits(usdcBalance, 6))
    };
}
```

**The Problem**:
- Agent only knows **one wallet** (from `PRIVATE_KEY` in .env)
- **No multi-user support** - all users would share same wallet!
- **Dashboard shows mock data** - not reading from agent

---

## **🚨 The Critical Gap: User Onboarding**

### **What's Missing**

Right now, the system assumes:
1. User has a wallet with a private key
2. That private key is in the `.env` file
3. That wallet has assets (ETH, USDC, SOL, etc.)

**This only works for ONE user (you, the developer)!**

---

## **💡 Solution: Three Options**

### **Option 1: Wallet Connect (Web3 Standard)** ⭐ **RECOMMENDED**

**User Flow**:
```
1. User visits dashboard
2. Clicks "Connect Wallet"
3. Chooses wallet (MetaMask, WalletConnect, etc.)
4. Signs message to authorize agent
5. Agent can now read balances & execute (with approvals)
6. Dashboard shows REAL balances
```

**Technologies**:
- **RainbowKit** or **ConnectKit** (wallet connection UI)
- **wagmi** (React hooks for wallet interaction)
- **viem** (TypeScript Ethereum library)
- **Privy** (optional: email + social login)

**Implementation**:
```typescript
// Frontend (Dashboard)
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

function Dashboard() {
    const { address, isConnected } = useAccount();
    const { data: ethBalance } = useBalance({ address });

    if (!isConnected) {
        return <ConnectButton />;
    }

    return (
        <div>
            <p>Address: {address}</p>
            <p>Balance: {ethBalance?.formatted} ETH</p>
        </div>
    );
}
```

**Agent Side**:
```typescript
// Backend API receives user's address
app.post('/api/agent/execute', async (req, res) => {
    const { userAddress, action } = req.body;

    // Agent acts on behalf of user
    // User must approve each transaction via wallet
});
```

**Pros**:
- ✅ Industry standard
- ✅ User keeps custody of funds
- ✅ Multi-user support
- ✅ Dashboard shows real data

**Cons**:
- ⚠️ User must approve each transaction (UX friction)
- ⚠️ Requires wallet setup

---

### **Option 2: Warden Spaces (On-Chain Accounts)** 🌟 **WARDEN-NATIVE**

**User Flow**:
```
1. User connects wallet
2. Agent creates a Warden Space for user
3. User deposits funds into Space
4. Agent has permission to execute on Space
5. All actions logged on-chain (transparent)
```

**What is a Warden Space?**
- On-chain smart account
- Stores agent state & permissions
- Supports approval rules (x/act module)
- Multi-signature support

**Implementation**:
```typescript
// Create Space for user
const space = await agentkit.createSpace({
    name: `RecurringExecutor_${userAddress}`,
    adminIntentId: '1',
    signIntentId: '1',
});

// User deposits ETH to Space
const depositTx = await userWallet.sendTransaction({
    to: space.address,
    value: ethers.parseEther('10'), // 10 ETH
});

// Agent can now execute on Space
await agentkit.executeOnSpace(space.id, {
    action: 'swap',
    tokenIn: 'ETH',
    tokenOut: 'USDC',
    amount: '1000000000000000000',
});
```

**Pros**:
- ✅ Warden-native solution
- ✅ On-chain permissions & audit trail
- ✅ Agent can auto-execute (no per-tx approval)
- ✅ Perfect for hackathon demo!

**Cons**:
- ⚠️ Warden-specific (not universal)
- ⚠️ Requires understanding of Spaces

---

### **Option 3: Custodial (Temporary Keys)** ⚠️ **NOT RECOMMENDED**

**User Flow**:
```
1. Agent generates temporary wallet for user
2. User deposits funds to that address
3. Agent stores private key in database (encrypted)
4. Agent acts with full custody
```

**Implementation**:
```typescript
// Generate wallet per user
const userWallet = ethers.Wallet.createRandom();

// Store encrypted private key
await db.users.create({
    email: user.email,
    encryptedPrivateKey: encrypt(userWallet.privateKey),
    address: userWallet.address,
});

// Agent executes with custody
const agentkit = new WardenAgentKit({
    privateKeyOrAccount: decrypt(user.encryptedPrivateKey),
});
```

**Pros**:
- ✅ Simple user experience
- ✅ Agent can auto-execute

**Cons**:
- ❌ User doesn't control funds (custodial)
- ❌ Security risk (private key storage)
- ❌ Judges may view negatively (not Web3 ethos)

---

## **🎨 Dashboard Data Flow**

### **Current (Mock Data)**

```
Dashboard (Frontend)
    ↓
Mock JSON data (hardcoded)
    ↓
UI displays fake $50,000 portfolio
```

### **Target (Real Data)**

```
User connects wallet (MetaMask)
    ↓
Dashboard reads balance via wagmi/viem
    ↓
API queries Warden Agent
    ↓
Agent queries on-chain balances
    ↓
Dashboard displays REAL portfolio
```

---

## **🔧 Implementation Guide**

### **Phase 1: Wallet Connection** (Day 1)

**Install Dependencies**:
```bash
bun add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

**Add to Dashboard**:
```typescript
// app/providers.tsx
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

const { chains, publicClient } = configureChains([mainnet, sepolia]);

const { connectors } = getDefaultWallets({
    appName: 'Recurring Executor Agent',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
    chains,
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
});

export function Providers({ children }) {
    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains}>
                {children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
```

**Add Connect Button**:
```typescript
// components/Header.tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
    return (
        <header>
            <h1>Recurring Executor Agent</h1>
            <ConnectButton />
        </header>
    );
}
```

---

### **Phase 2: Read Real Balances** (Day 2)

**Portfolio Component**:
```typescript
// components/Portfolio.tsx
import { useAccount, useBalance, useContractRead } from 'wagmi';

export function Portfolio() {
    const { address, isConnected } = useAccount();

    // Get ETH balance
    const { data: ethBalance } = useBalance({
        address,
    });

    // Get USDC balance (ERC20)
    const { data: usdcBalance } = useContractRead({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
    });

    if (!isConnected) {
        return <div>Please connect wallet</div>;
    }

    const totalValue = calculateTotalValue(ethBalance, usdcBalance);

    return (
        <div>
            <h2>Your Portfolio</h2>
            <p>Total Value: ${totalValue}</p>
            <ul>
                <li>ETH: {ethBalance?.formatted}</li>
                <li>USDC: {formatUnits(usdcBalance || 0n, 6)}</li>
            </ul>
        </div>
    );
}
```

---

### **Phase 3: Agent Execution** (Day 3)

**API Endpoint**:
```typescript
// pages/api/agent/execute.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';

export default async function handler(req, res) {
    const { userAddress, action, params } = req.body;

    // Verify user signature (important!)
    const isValid = await verifySignature(req.body.signature);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // Agent acts on behalf of user
    // User must still approve transaction via wallet
    const agentkit = new WardenAgentKit({
        // Agent's key for orchestration
        privateKeyOrAccount: process.env.AGENT_PRIVATE_KEY,
    });

    // Prepare transaction for user to sign
    const tx = await agentkit.prepareSwap({
        from: userAddress,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amount,
    });

    // Return tx for user to sign with their wallet
    res.json({ transaction: tx });
}
```

**Frontend Execution**:
```typescript
// Frontend
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

function SwapButton() {
    const { config } = usePrepareContractWrite({
        address: DEX_ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swap',
        args: [tokenIn, tokenOut, amount],
    });

    const { write, isLoading } = useContractWrite(config);

    return (
        <button onClick={() => write?.()}>
            {isLoading ? 'Swapping...' : 'Swap ETH → USDC'}
        </button>
    );
}
```

---

## **📋 Summary: Data Sources**

| Data Type | Source | Status | Implementation |
|-----------|--------|--------|----------------|
| **Prices** | Warden x/oracle (Skip:Connect) | ✅ LIVE | `agentkit.queryOracle()` |
| **Balances** | User's wallet (on-chain) | ⚠️ CAN READ | Need wallet connection |
| **Transaction History** | On-chain events | ⚠️ CAN READ | Need blockchain indexer |
| **Agent Actions** | Warden Space logs | ❌ MOCK | Need Space integration |
| **Trigger Status** | In-memory state | ❌ MOCK | Need persistent storage |

---

## **🎯 Recommended Immediate Action**

### **For Hackathon Demo**

**Option A: Wallet Connect (2 days)**
1. Add RainbowKit to dashboard
2. Read real balances from connected wallet
3. Agent prepares transactions, user signs
4. **Demo**: "Connect wallet, see real portfolio, execute rebalance"

**Option B: Warden Spaces (3 days)**
1. Create Space per user
2. User deposits to Space address
3. Agent auto-executes on Space (no per-tx approval)
4. **Demo**: "One-click setup, agent fully automated"

**Option C: Mock Data + Voice-Over (0 days)**
1. Keep current beautiful dashboard
2. During demo, say: "Here's a mock portfolio showing the UI"
3. Show code that reads real balances
4. **Demo**: "Production-ready architecture, pending wallet integration"

---

## **💡 My Recommendation**

### **For Judging Criteria**

**If you have 3+ days**: **Option B (Warden Spaces)**
- Shows deep Warden integration
- Demonstrates understanding of Spaces
- Auto-execution is impressive
- **Judge Impact**: 🌟🌟🌟🌟🌟

**If you have 1-2 days**: **Option A (Wallet Connect)**
- Industry standard approach
- Shows Web3 UX understanding
- Easy to demo
- **Judge Impact**: 🌟🌟🌟🌟

**If < 1 day**: **Option C (Voice-Over)**
- No implementation risk
- Focus on polish & documentation
- Still competitive!
- **Judge Impact**: 🌟🌟🌟

---

## **📝 Quick Implementation Script**

If choosing **Option A (Wallet Connect)**:

```bash
# 1. Install dependencies
bun add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query

# 2. Get WalletConnect Project ID
# Visit: https://cloud.walletconnect.com/sign-in

# 3. Add to .env
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id" >> .env

# 4. Wrap app with providers (see code above)

# 5. Add ConnectButton to layout

# 6. Update Portfolio page to use useAccount & useBalance hooks

# 7. Test with MetaMask
```

**Time**: 4-6 hours for basic implementation

---

## **✅ Final Checklist**

Before considering "user onboarding complete":

- [ ] Users can connect wallet
- [ ] Dashboard shows REAL balances
- [ ] Agent can read user's portfolio
- [ ] Triggers work with user's assets
- [ ] Rebalancing calculates from real holdings
- [ ] Transaction execution requires user approval
- [ ] Error handling for no funds/wrong network
- [ ] Clear UX for wallet disconnection

---

<div align="center">

## **🎯 Bottom Line**

**Current State**: Beautiful dashboard, mock data
**Target State**: Beautiful dashboard, **real user data**

**Gap**: Wallet connection + balance reading
**Effort**: 4-6 hours (wallet connect) OR 1-2 days (Warden Spaces)

**Your Call**: Implement now, or demo with voice-over?

</div>

