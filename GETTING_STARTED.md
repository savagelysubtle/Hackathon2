# 🚀 Getting Started with Recurring Executor Agent

Complete setup guide to get your agent running in **5 minutes**!

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **[Bun](https://bun.sh)** installed (`curl -fsSL https://bun.sh/install | bash`)
- ✅ **OpenAI API Key** ([get one here](https://platform.openai.com/api-keys))
- ✅ **Text Editor** (VS Code, Cursor, etc.)
- ✅ **Git** installed

---

## ⚡ Quick Setup (5 Minutes)

### **Step 1: Clone Repository**

```bash
git clone https://github.com/savagelysubtle/Hackathon2.git
cd Hackathon2
```

### **Step 2: Install Dependencies**

```bash
bun install
```

This installs all required packages including:
- `@wardenprotocol/warden-agent-kit-core`
- `@wardenprotocol/warden-langchain`
- `node-cron`
- `ethers`
- And more...

### **Step 3: Configure Environment**

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your favorite editor
code .env  # or nano .env, vim .env, etc.
```

Add your keys to `.env`:

```bash
# Required
OPENAI_API_KEY=sk-...your-key-here...
PRIVATE_KEY=0x...your-private-key...

# Optional (for Warden testnet, when ready)
WARDEN_RPC_URL=https://warden-testnet.node.wardenprotocol.org
WARDEN_CHAIN_ID=wardenprotocol-testnet-1
```

**🔐 Security Note**: Never commit `.env` to git! It's already in `.gitignore`.

### **Step 4: Generate Wallet** (Optional)

If you don't have a testnet wallet:

```bash
bun run generate-wallet
```

This will:
- Generate a new Ethereum wallet
- Display your address and private key
- Guide you to add it to `.env`

**⚠️ Important**: Only use this wallet for **testnet**! Never use it for real funds!

### **Step 5: Verify Setup**

```bash
bun run check-env
```

Expected output:
```
🔍 Diagnostic Check

📋 Environment Variables:
─────────────────────────────────────────────────
PRIVATE_KEY:     ✅ Set (0x3b99...41d0)
OPENAI_API_KEY:  ✅ Set

✅ Environment configuration looks good!
```

---

## 🧪 Test Your Installation

Run these tests to verify everything works (no Warden testnet needed!):

### **Test 1: Core Logic** (~2 seconds)

```bash
bun src/tests/test-trigger-logic.ts
```

Expected output:
```
✅ ALL LOGIC TESTS PASSED!

📊 Summary:
   ✅ Percentage calculations correct
   ✅ Trigger conditions work
   ✅ Action calculations accurate
   ✅ State management prevents double-triggering
```

### **Test 2: Integration** (~12 seconds)

```bash
bun src/tests/test-integration.ts
```

Expected output:
```
✅ INTEGRATION TEST PASSED!

📊 Test Summary:
   ✅ Scheduler executed jobs successfully
   ✅ Trigger detected 15% price pump
   ✅ Conditional action executed
   ✅ State management prevented double-firing
   ✅ All components integrated correctly
```

### **Test 3: Scheduler** (~30 seconds)

```bash
bun src/tests/test-scheduler.ts
```

Expected output:
```
✅ SCHEDULER TEST COMPLETE!

📊 Results:
   ✅ Job scheduling works
   ✅ Cron expressions validated
   ✅ Jobs execute on schedule
   ✅ Disabled jobs skip correctly
```

**All tests passing?** 🎉 **You're ready to go!**

---

## 🌐 Connect to Warden Testnet (When Ready)

### **Step 1: Get Testnet Tokens**

Visit the [Warden Faucet](https://faucet.wardenprotocol.org) or use Discord:

```
Discord: #faucet channel
Command: !faucet YOUR_ADDRESS
```

Your address is shown when you run:
```bash
bun run check-env
```

### **Step 2: Create Warden Space**

```bash
bun run setup
```

This will:
- Connect to Warden testnet
- Display your address and balance
- Create a new Warden Space
- Store Space ID for future use

Expected output:
```
✅ Connected to Warden Testnet

📍 Agent Address: 0x...
🔗 View on Explorer: https://explorer.wardenprotocol.org/address/...

💰 Checking balance...
   WARD Balance: 10.0 WARD
   ✅ Sufficient balance for testing

🏠 Creating Warden Space...
✅ Space Created Successfully!
   Space ID: 12345
   Space Address: warden1...
```

### **Step 3: Run Full Agent**

```bash
bun run start
```

This starts the complete agent with:
- ⚖️ Weekly portfolio rebalancing (Sunday 10AM)
- 🎯 Price trigger monitoring (every 5 min)
- 🏥 Daily health checks (midnight)

Expected output:
```
🤖 Initializing Recurring Executor Agent...

⚖️  Setting up Portfolio Rebalancer...
   ✅ Rebalancer configured: 60% ETH / 40% USDC

🎯 Setting up Price Triggers...
   ✅ SOL pump trigger: Sell 10% at +15%
   ✅ ETH pump trigger: Sell 5% at +20%

📅 Setting up Scheduled Jobs...
   ✅ 3 scheduled jobs configured

✅ Agent is running!
   Press Ctrl+C to stop.
```

---

## 🎯 Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `bun install` | Install dependencies | First-time setup |
| `bun run check-env` | Verify environment | After configuring .env |
| `bun run generate-wallet` | Create new wallet | If you need a testnet wallet |
| `bun src/tests/test-trigger-logic.ts` | Test trigger logic | Verify core functionality |
| `bun src/tests/test-integration.ts` | Test full integration | Verify all components |
| `bun src/tests/test-scheduler.ts` | Test scheduler | Verify job execution |
| `bun run setup` | Setup Warden Space | Connect to testnet |
| `bun run start` | Start full agent | Run autonomous agent |

---

## 📖 Next Steps

### **Learn More**
- 📚 Read **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** for complete documentation
- 🗺️ Review **[MVP_PLAN.md](./MVP_PLAN.md)** for development roadmap
- 🔍 Explore **[docs/](./docs/)** for deep technical research

### **Customize Your Agent**
- Edit `src/agent/recurring-executor.ts` to add more triggers
- Modify `src/strategies/rebalancer.ts` to change allocations
- Adjust schedules in the main agent configuration

### **Test & Experiment**
- Run tests frequently to verify changes
- Experiment with different trigger thresholds
- Try different rebalancing strategies

---

## 🐛 Troubleshooting

### **"Command not found: bun"**
Install Bun: `curl -fsSL https://bun.sh/install | bash`

### **"PRIVATE_KEY not found"**
Run `bun run generate-wallet` or add your key to `.env`

### **"Insufficient WARD balance"**
Visit https://faucet.wardenprotocol.org to get testnet tokens

### **Tests hanging or timing out**
- Check internet connection
- Verify Warden testnet is operational (Discord)
- Try tests again after a few minutes

### **"Connection timeout"**
The Warden testnet might be slow or temporarily unavailable. Check:
- [Warden Discord](https://discord.gg/wardenprotocol) for status
- Network connectivity
- Try again later

---

## 💬 Getting Help

- **Documentation**: All docs in this repository
- **Discord**: [Warden Protocol Community](https://discord.gg/wardenprotocol)
- **Issues**: [GitHub Issues](https://github.com/savagelysubtle/Hackathon2/issues)
- **Email**: simpleflowworks@gmail.com

---

## ✅ Checklist

Before running the agent, verify:

- [ ] Bun installed
- [ ] Dependencies installed (`bun install`)
- [ ] `.env` configured with API keys
- [ ] Tests passing (`test-trigger-logic.ts`, `test-integration.ts`)
- [ ] Testnet tokens obtained (if using Warden testnet)
- [ ] Warden Space created (`bun run setup`)

**All checked?** You're ready to run autonomous DeFi automation! 🚀

---

<div align="center">

**Questions?** Check [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) or ask in [Discord](https://discord.gg/wardenprotocol)!

[← Back to README](./README.md) • [View Architecture →](./docs/ARCHITECTURE.md)

</div>
