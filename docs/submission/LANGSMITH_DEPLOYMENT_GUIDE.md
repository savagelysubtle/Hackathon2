# 🚀 LangSmith Cloud Deployment Guide
## **Deploy Your Recurring Executor Agent for Warden Builder Incentive Program**

---

## 📋 **Prerequisites**

### **1. LangSmith Account Requirements**
- ✅ **LangSmith Plus or Enterprise Plan** (REQUIRED for deployment!)
- ❌ Free tier does NOT support cloud deployment
- 💰 **Cost**: ~$39/month for Plus plan

**Sign up**: https://smith.langchain.com

### **2. Your Project Requirements**
- ✅ GitHub repository (public or private)
- ✅ LangGraph agent code
- ✅ `langgraph.json` configuration file
- ✅ Dependencies file (`requirements.txt` or `pyproject.toml`)

---

## ⚡ **Quick Start: Deploy in 5 Steps**

### **Step 1: Upgrade to LangSmith Plus** 💳

**Why**: Free tier doesn't support cloud deployment

**How**:
1. Go to https://smith.langchain.com
2. Click your profile (top-right)
3. Select **Billing** or **Upgrade Plan**
4. Choose **LangSmith Plus** ($39/month)
5. Complete payment

**What you get**:
- ✅ Cloud deployment
- ✅ LangGraph Platform access
- ✅ API endpoints
- ✅ Auto-scaling
- ✅ Monitoring & tracing

### **Step 2: Create LangSmith API Key** 🔑

**How**:
1. Log into https://smith.langchain.com
2. Click **Settings** (gear icon, bottom-left)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Give it a name: `Warden-Agent-Deployment`
6. **Copy the key** (you won't see it again!)

**Save to `.env`**:
```bash
LANGSMITH_API_KEY=your-api-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=recurring-executor-agent
```

### **Step 3: Prepare Your Repository** 📦

Your project needs a specific structure for LangSmith deployment:

#### **Required File: `langgraph.json`**

Create this file in your project root:

```json
{
  "dependencies": [
    "."
  ],
  "graphs": {
    "agent": {
      "path": "./src/agent/graph.py",
      "description": "Recurring Executor Agent - DeFi Portfolio Automation"
    }
  },
  "env": {
    "OPENAI_API_KEY": "",
    "PRIVATE_KEY": ""
  }
}
```

**Field explanations**:
- `dependencies`: Files/folders to include (`.` = everything)
- `graphs.agent`: Your main agent graph
  - `path`: Path to your graph file (adjust to match your structure)
  - `description`: Agent description for marketplace
- `env`: Environment variables needed

#### **For TypeScript Projects**

If your project is TypeScript (like yours), adjust the path:

```json
{
  "dependencies": [
    "."
  ],
  "graphs": {
    "agent": {
      "path": "./src/agent/graph.ts",
      "description": "Recurring Executor Agent - DeFi Portfolio Automation with Natural Language Control"
    }
  },
  "env": {
    "OPENAI_API_KEY": "",
    "PRIVATE_KEY": "",
    "WARDEN_RPC_URL": "",
    "WARDEN_CHAIN_ID": ""
  }
}
```

#### **Dependencies File**

Ensure you have either:

**Python** - `requirements.txt`:
```txt
langgraph>=0.2.0
langchain>=0.3.0
langchain-openai>=0.2.0
@wardenprotocol/warden-agent-kit-core
python-dotenv
```

**TypeScript** - `package.json` (you already have this!):
```json
{
  "name": "recurring-executor-agent",
  "dependencies": {
    "@langchain/langgraph": "latest",
    "@langchain/core": "latest",
    "@langchain/openai": "latest",
    "@wardenprotocol/warden-agent-kit-core": "latest",
    "dotenv": "latest"
  }
}
```

### **Step 4: Deploy to LangSmith** 🚀

#### **Option A: Deploy via LangSmith Dashboard (Recommended)**

1. **Go to LangSmith**: https://smith.langchain.com

2. **Navigate to Deployments**:
   - Click **Deployments** in left sidebar
   - Click **+ New Deployment** button

3. **Connect GitHub** (first time only):
   - Click **Import from GitHub**
   - Authorize LangSmith to access your GitHub
   - Grant access to your repository

4. **Select Repository**:
   - Choose `savagelysubtle/Hackathon2`
   - Select branch: `main` (or your default branch)

5. **Configure Deployment**:
   - **Name**: `recurring-executor-agent`
   - **Assistant Name**: `agent` (must match `langgraph.json`)
   - **Environment Variables**: Add from `.env`:
     - `OPENAI_API_KEY`: your-openai-key
     - `PRIVATE_KEY`: your-warden-private-key (optional for deployment testing)

6. **Deploy**:
   - Click **Submit**
   - Wait ~15 minutes for deployment to complete
   - Status will change from "Building" → "Running"

#### **Option B: Deploy via CLI** (Advanced)

```bash
# Install LangGraph CLI
pip install -U "langgraph-cli[inmem]"

# Build your agent
langgraph build

# Test locally first
langgraph dev

# Deploy to cloud (requires LangSmith Plus)
langgraph deploy --api-key your-langsmith-api-key
```

### **Step 5: Test Your Deployment** ✅

#### **Via LangSmith Studio**

1. Go to your deployment in LangSmith
2. Click **Studio** button
3. Interact with your agent visually
4. Test commands like:
   - "What's my portfolio allocation?"
   - "Create a trigger to sell 10% SOL if it pumps 20%"

#### **Via API (Python)**

```python
from langgraph_sdk import get_client

# Your deployment URL (from LangSmith dashboard)
client = get_client(
    url="https://your-deployment-url.langsmith.com",
    api_key="your-langsmith-api-key"
)

# Test the agent
async for chunk in client.runs.stream(
    None,  # Threadless run
    "agent",  # Assistant name from langgraph.json
    input={
        "messages": [{
            "role": "human",
            "content": "What is my current portfolio?",
        }],
    },
    stream_mode="updates",
):
    print(f"Event type: {chunk.event}")
    print(chunk.data)
```

#### **Via API (TypeScript)**

```typescript
import { Client } from "@langchain/langgraph-sdk";

// Your deployment URL
const client = new Client({
  apiUrl: "https://your-deployment-url.langsmith.com",
  apiKey: "your-langsmith-api-key"
});

// Test the agent
const stream = client.runs.stream(
  null,  // Threadless run
  "agent",  // Assistant name
  {
    input: {
      messages: [{
        role: "human",
        content: "Show me my triggers"
      }]
    },
    streamMode: "updates"
  }
);

for await (const chunk of stream) {
  console.log("Event:", chunk.event);
  console.log("Data:", chunk.data);
}
```

---

## 🔄 **Alternative: Self-Hosted Deployment**

If you don't want to pay for LangSmith Plus, you can self-host:

### **Option 1: Docker (Local)**

```bash
# Install Docker Desktop first

# Clone and run
git clone https://github.com/savagelysubtle/Hackathon2.git
cd Hackathon2

# Create Dockerfile
cat > Dockerfile << EOF
FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "-m", "langgraph", "serve"]
EOF

# Build and run
docker build -t recurring-executor-agent .
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  -e PRIVATE_KEY=your-key \
  recurring-executor-agent
```

### **Option 2: Railway, Render, or Vercel**

These platforms offer free tiers and support Node.js/TypeScript:

**Railway**:
1. Connect GitHub repo
2. Add environment variables
3. Deploy with one click
4. Get public URL

**Render**:
1. New Web Service → GitHub
2. Select repo
3. Build command: `bun install`
4. Start command: `bun run src/agent/graph.ts`
5. Add env vars

**Vercel** (Serverless):
1. Import GitHub project
2. Framework: Next.js (if using dashboard)
3. Add env vars
4. Deploy

---

## 🎯 **For Warden Builder Incentive Program**

### **Requirements Check**

✅ **Built with LangGraph**: You're using LangChain (need to adapt)
✅ **Can deploy to LangSmith Cloud**: Follow steps above
✅ **Can self-host**: Alternative options provided

### **Recommended Path**

1. **For Qualification**: Deploy to LangSmith Cloud
   - Pays for itself with $10K reward!
   - Most aligned with program requirements
   - Professional deployment

2. **For Development**: Test locally first
   ```bash
   bun run dev  # Your current dashboard
   langgraph dev  # Test agent locally
   ```

3. **For Cost Savings**: Use self-hosted after initial qualification
   - Deploy to LangSmith for program entry
   - Migrate to self-hosted later
   - Keep LangSmith for monitoring

---

## 📊 **Architecture: Your Agent on LangSmith**

```
┌──────────────────────────────────────────────────────┐
│  Warden Agent Hub (End of Month)                     │
│  ├─ Discovers your agent via onchain identity        │
│  ├─ Links to your LangSmith deployment               │
│  └─ 13M users can access your agent                  │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│  LangSmith Cloud Deployment                          │
│  ├─ Auto-scaling API endpoint                        │
│  ├─ Monitoring & tracing                             │
│  ├─ Environment variables (secure)                   │
│  └─ Handles 1000s of concurrent requests             │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│  Your LangGraph Agent                                │
│  ├─ Graph.ts (agent logic)                           │
│  ├─ Warden Agent Kit (blockchain ops)                │
│  ├─ OpenAI GPT-4 (intelligence)                      │
│  └─ Triggers, rebalancing, chat                      │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│  User's Wallet (via Warden)                          │
│  ├─ Non-custodial (user maintains control)           │
│  ├─ Agent proposes transactions                      │
│  └─ User signs in their wallet                       │
└──────────────────────────────────────────────────────┘
```

---

## 💡 **Important Considerations**

### **LangChain vs LangGraph**

Your project currently uses **LangChain**. The Warden program requires **LangGraph**.

**Migration Path**:
1. Keep your current LangChain code
2. Wrap it in a LangGraph graph structure
3. Add stateful workflow management
4. This makes it LangGraph-compatible!

**Quick Migration Example**:

```typescript
// Before (LangChain)
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const llm = new ChatOpenAI({ modelName: "gpt-4" });
const agent = createReactAgent({ llm, tools });

// After (LangGraph - add graph structure)
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph({
  channels: {
    messages: { reducer: (x, y) => x.concat(y) }
  }
});

workflow.addNode("agent", agentNode);
workflow.addEdge("__start__", "agent");
const app = workflow.compile();
```

### **Cost Analysis**

**LangSmith Plus**: $39/month
**Potential Reward**: $10,000+ (first month) + ongoing

**ROI**: If you win top 10, that's **256x return** in first month alone!

**Strategy**:
1. Pay for 1-2 months to qualify ($78-$156)
2. Win $10K+ in rewards
3. Either keep it (for features) or migrate to self-hosted
4. Net profit: $9,844+

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**
```
[ ] LangSmith Plus account activated ($39/month)
[ ] LangSmith API key created
[ ] GitHub repository ready (public or private)
[ ] langgraph.json file created
[ ] Dependencies file updated
[ ] Environment variables configured
[ ] Code pushed to GitHub
```

### **Deployment**
```
[ ] Connected GitHub to LangSmith
[ ] Selected repository in LangSmith
[ ] Configured environment variables
[ ] Submitted deployment
[ ] Waited for build to complete (~15 min)
[ ] Deployment status: Running ✅
```

### **Testing**
```
[ ] Tested via LangSmith Studio
[ ] Tested via API (Python or TypeScript)
[ ] Verified agent responds correctly
[ ] Checked monitoring/tracing works
[ ] Got deployment URL for Warden registration
```

### **Warden Program**
```
[ ] Add deployment URL to Warden registration
[ ] Add to Community Agents repo
[ ] Test end-to-end user flow
[ ] Prepare for Agent Hub launch
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Deployment Failed - Build Error"**

**Cause**: Missing dependencies or wrong paths in `langgraph.json`

**Solution**:
- Check `langgraph.json` paths are correct
- Ensure `package.json` or `requirements.txt` is complete
- Review build logs in LangSmith dashboard

### **Issue 2: "API Key Invalid"**

**Cause**: Wrong API key or not set in environment

**Solution**:
- Regenerate API key in LangSmith Settings
- Add to deployment environment variables
- Check spelling and no extra spaces

### **Issue 3: "Agent Not Responding"**

**Cause**: Graph configuration error

**Solution**:
- Test locally with `langgraph dev` first
- Check assistant name matches `langgraph.json`
- Verify all environment variables are set

### **Issue 4: "Free Tier - Can't Deploy"**

**Cause**: Free tier doesn't support deployment

**Solution**:
- Upgrade to Plus plan ($39/month)
- Or use self-hosted option (Docker, Railway, Render)
- Investment pays for itself with $10K reward!

---

## 📚 **Additional Resources**

### **Official Documentation**
- **LangSmith Cloud**: https://docs.langchain.com/langsmith/deploy-to-cloud
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **Deployment Quickstart**: https://docs.langchain.com/langgraph-platform/deployment-quickstart
- **LangGraph CLI**: https://langchain-ai.github.io/langgraph/tutorials/langgraph-platform/local-server/

### **Example Projects**
- **LangGraph Templates**: https://github.com/langchain-ai/new-langgraph-project-python
- **Community Examples**: https://github.com/langchain-ai/langgraphjs

### **Support**
- **LangChain Discord**: https://discord.gg/langchain
- **LangSmith Docs**: https://docs.smith.langchain.com
- **GitHub Issues**: https://github.com/langchain-ai/langgraph/issues

---

## 🎯 **Next Steps**

### **Today**
1. ✅ Sign up for LangSmith Plus
2. ✅ Create API key
3. ✅ Create `langgraph.json` file

### **This Week**
1. Adapt agent for LangGraph (if needed)
2. Test locally with `langgraph dev`
3. Deploy to LangSmith Cloud
4. Test deployment thoroughly

### **Before Agent Hub Launch**
1. Add deployment URL to Warden registration
2. Ensure agent is stable and responsive
3. Prepare for 13M user traffic!

---

## 🚀 **Bottom Line**

**Deployment Path**:
1. **LangSmith Plus** ($39/month) → Professional deployment
2. **Deploy via Dashboard** → 5-step process above
3. **Test thoroughly** → Ensure it works
4. **Register with Warden** → Include deployment URL
5. **Launch Day** → Be in top 10, win $10K+!

**Total Investment**: ~$39-$78 (1-2 months)
**Total Potential Reward**: $10,000-$30,000+ (both programs)

**ROI**: 256x to 769x return!

**GO DEPLOY AND WIN!** 🏆

---

**Last Updated**: November 15, 2025
**Official Docs**: https://docs.langchain.com/langsmith/deploy-to-cloud
**Your Project**: https://github.com/savagelysubtle/Hackathon2

