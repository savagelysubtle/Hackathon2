# 🎨 Build a Web Dashboard for Recurring Executor Agent

## **Project Overview**

You are building a **real-time monitoring dashboard** for the Recurring Executor Agent - a DeFi portfolio automation system built with Warden Protocol. The agent autonomously manages portfolios, executes price-based triggers, and rebalances assets on a schedule.

---

## **📋 Context**

### **What the Agent Does**

The Recurring Executor Agent is a production-ready TypeScript application that:

1. **Scheduled Rebalancing** ⚖️
   - Maintains 60% ETH / 40% USDC allocation
   - Rebalances weekly (Sunday 10AM)
   - Triggers when drift > 5%

2. **Price Triggers** 🎯
   - "Sell 10% SOL if it pumps 15%"
   - "Sell 5% ETH if it pumps 20%"
   - Checks every 5 minutes

3. **Health Monitoring** 🏥
   - Daily health checks
   - Balance verification
   - Oracle connectivity tests

### **Tech Stack**

- **Backend**: TypeScript/Bun
- **Blockchain**: Warden Protocol
- **Scheduling**: node-cron
- **Oracle**: x/oracle (Skip:Connect)
- **State**: 2,000+ lines of production code

---

## **🎯 Your Mission**

Build a **modern, real-time web dashboard** that visualizes the agent's operations, portfolio state, and execution history.

---

## **🏗️ Dashboard Requirements**

### **1. Overview Page** (Home)

Display key metrics and status:

**Components Needed**:
- 🟢 **Agent Status Badge** - Running/Stopped/Error
- 💰 **Portfolio Value** - Total USD value (large, prominent)
- 📊 **Current Allocation** - Pie chart (60% ETH, 40% USDC)
- 📈 **24h Performance** - Change in portfolio value
- ⏰ **Next Scheduled Action** - Countdown timer
- 🎯 **Active Triggers** - Count of active price triggers
- ✅ **Last Health Check** - Timestamp and status

**Layout**: Hero section with key stats, then grid of cards

---

### **2. Portfolio Page**

Real-time portfolio visualization:

**Components Needed**:
- 📊 **Allocation Chart** - Current vs Target (donut/pie chart)
- 📉 **Drift Indicator** - Show how far from target (progress bar)
- 💹 **Asset Breakdown** - Table with:
  - Asset name (ETH, USDC, SOL)
  - Holdings amount
  - Current price
  - USD value
  - % of portfolio
  - 24h change
- 📈 **Portfolio History** - Line chart showing value over time
- ⚖️ **Rebalance History** - Timeline of past rebalances

**Data Sources**:
- `PortfolioRebalancer.getStatus()`
- `PortfolioRebalancer.getHistory()`
- `PriceFetcher.getPrices()`

---

### **3. Triggers Page**

Monitor and manage price triggers:

**Components Needed**:
- 🎯 **Active Triggers** - Cards showing:
  - Asset (SOL, ETH)
  - Baseline price
  - Current price
  - % change (color-coded)
  - Threshold (15%, 20%)
  - Action (Sell 10%)
  - Status badge (Active/Triggered/Waiting)
  - Progress bar to threshold
- 📊 **Price Charts** - Real-time price line charts for each asset
- 🔔 **Trigger History** - Table of past trigger executions
- ➕ **Add Trigger** - Form to create new triggers (optional)

**Data Sources**:
- `PriceTrigger.getStatus()`
- `PriceFetcher.getPrice(currencyPair)`
- Execution logs

---

### **4. Scheduler Page**

View scheduled jobs and execution history:

**Components Needed**:
- 📅 **Active Jobs** - Cards for each job:
  - Job name (Weekly Rebalance, Trigger Check, Health Check)
  - Schedule (cron expression + human-readable)
  - Last run timestamp
  - Next run countdown
  - Status (Running/Idle)
  - Execution stats (success rate, avg duration)
- 📊 **Execution Timeline** - Visual timeline of job executions
- 📈 **Statistics** - Charts showing:
  - Executions per day
  - Success/failure rates
  - Average execution time

**Data Sources**:
- `CronScheduler.getStatistics()`
- `CronScheduler.listJobs()`
- `CronScheduler.getExecutionLogs()`

---

### **5. Activity Log Page**

Comprehensive execution history:

**Components Needed**:
- 📝 **Activity Feed** - Infinite scroll list showing:
  - Timestamp
  - Action type (Swap, Rebalance, Trigger, Health Check)
  - Status icon (✅/❌)
  - Details (amounts, prices)
  - Transaction hash (clickable to explorer)
  - Duration
- 🔍 **Filters** - Filter by:
  - Action type
  - Date range
  - Status (success/failure)
  - Asset
- 📊 **Activity Stats** - Summary cards:
  - Total actions
  - Success rate
  - Total volume traded

**Data Sources**:
- `SwapExecutor` logs
- `PortfolioRebalancer.getHistory()`
- Warden Space state

---

### **6. Settings Page** (Optional)

Configure agent parameters:

**Components**:
- ⚙️ **Portfolio Settings**
  - Target allocation sliders
  - Drift threshold input
- 🎯 **Trigger Settings**
  - Add/remove/edit triggers
  - Enable/disable individual triggers
- 📅 **Schedule Settings**
  - Modify cron schedules
  - Enable/disable jobs
- 🔐 **Connection Settings**
  - RPC endpoints
  - API keys (masked)

---

## **🎨 Design Requirements**

### **Visual Style**

**Theme**: Modern, dark-mode-first dashboard (like Stripe, Vercel, or Grafana)

**Colors**:
- Background: Dark navy/charcoal (#0A0E1A, #1A1F2E)
- Primary: Electric blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Text: White/light gray

**Typography**:
- Headings: Bold, sans-serif (Inter, Geist, SF Pro)
- Body: Regular, readable
- Monospace: Code/addresses (JetBrains Mono, Fira Code)

**Components**:
- Cards with subtle shadows and borders
- Smooth animations (fade-in, slide-in)
- Responsive grid layout
- Glass-morphism effects (optional)

---

## **🛠️ Technical Specifications**

### **Recommended Tech Stack**

**Frontend Framework**: Choose one:
- ✅ **Next.js 14** (App Router) - Recommended for full-stack
- ✅ **React + Vite** - For SPA
- ✅ **SvelteKit** - For lightweight

**UI Library**: Choose one:
- ✅ **shadcn/ui** - Highly recommended (Radix + Tailwind)
- ✅ **Chakra UI** - Good for rapid development
- ✅ **Mantine** - Feature-rich

**Charts**: Choose one:
- ✅ **Recharts** - Simple, React-native
- ✅ **Chart.js** - Powerful, flexible
- ✅ **Apache ECharts** - Enterprise-grade

**Real-time Updates**:
- WebSocket connection to agent
- Or polling every 5-10 seconds

**State Management**:
- React Query / TanStack Query (recommended)
- Or Zustand for client state

---

## **📡 API Integration**

### **Backend API Endpoints Needed**

Create a simple Express/Fastify server that exposes:

```typescript
// Status & Overview
GET  /api/status              // Agent status, portfolio value, metrics
GET  /api/portfolio           // Current portfolio state
GET  /api/portfolio/history   // Historical snapshots

// Triggers
GET  /api/triggers            // List active triggers
GET  /api/triggers/:id        // Get specific trigger
POST /api/triggers            // Create new trigger (optional)

// Scheduler
GET  /api/jobs                // List scheduled jobs
GET  /api/jobs/:id            // Get job details
GET  /api/jobs/:id/history    // Job execution history

// Activity
GET  /api/activity            // Activity feed (paginated)
GET  /api/activity/stats      // Activity statistics

// Prices (real-time)
GET  /api/prices              // Current prices for all assets
GET  /api/prices/:pair        // Specific currency pair

// Health
GET  /api/health              // Health check status
```

### **Example Response Formats**

**GET /api/status**
```json
{
  "agentStatus": "running",
  "portfolioValue": 50000.00,
  "allocation": {
    "ETH": 60.0,
    "USDC": 40.0
  },
  "performance24h": 2.5,
  "nextAction": {
    "type": "rebalance",
    "scheduledAt": "2025-11-17T10:00:00Z",
    "timeUntil": 3600
  },
  "activeTriggers": 2,
  "lastHealthCheck": "2025-11-15T00:00:00Z"
}
```

**GET /api/triggers**
```json
{
  "triggers": [
    {
      "id": "sol-pump-sell",
      "asset": "SOL",
      "baselinePrice": 200,
      "currentPrice": 215,
      "percentageChange": 7.5,
      "threshold": 15,
      "action": "Sell 10%",
      "status": "active",
      "progress": 50
    }
  ]
}
```

---

## **🚀 Implementation Plan**

### **Phase 1: Setup** (Week 1)
1. Initialize Next.js/React project
2. Install dependencies (shadcn/ui, Recharts, etc.)
3. Setup Tailwind CSS with dark theme
4. Create basic layout (sidebar, header)
5. Setup routing

### **Phase 2: Core Pages** (Week 2)
1. Build Overview page with key metrics
2. Implement Portfolio page with charts
3. Create Triggers page with real-time updates

### **Phase 3: Advanced Features** (Week 3)
1. Add Scheduler page
2. Implement Activity Log with pagination
3. Add Settings page (optional)

### **Phase 4: Polish** (Week 4)
1. Add real-time WebSocket updates
2. Implement responsive design
3. Add animations and transitions
4. Performance optimization
5. Error handling and loading states

---

## **📊 Key Features to Implement**

### **Must Have** ✅
- [ ] Real-time portfolio value display
- [ ] Current allocation vs target visualization
- [ ] Active triggers with progress indicators
- [ ] Scheduled jobs list with next run times
- [ ] Activity feed with recent actions
- [ ] Responsive design (mobile-friendly)
- [ ] Dark mode theme

### **Nice to Have** ⭐
- [ ] Price charts with historical data
- [ ] Portfolio performance graphs
- [ ] Email/Telegram notifications
- [ ] Export data to CSV
- [ ] Settings to modify triggers/schedules
- [ ] Transaction explorer links
- [ ] Light mode theme

---

## **🎯 Success Criteria**

Your dashboard should:
1. ✅ Display real-time agent status and metrics
2. ✅ Visualize portfolio allocation clearly
3. ✅ Show active triggers and their progress
4. ✅ List scheduled jobs with execution history
5. ✅ Provide comprehensive activity log
6. ✅ Be responsive and mobile-friendly
7. ✅ Have smooth animations and transitions
8. ✅ Load quickly (< 2 seconds initial load)

---

## **📁 Project Structure**

### **Existing Agent Code** (Reference)

Located in `D:\Coding\Hackathon2\`:

```
src/
├── agent/
│   └── recurring-executor.ts      # Main agent class
├── scheduler/
│   └── cron-scheduler.ts          # Job scheduling
├── strategies/
│   └── rebalancer.ts              # Portfolio rebalancing
├── triggers/
│   └── price-trigger.ts           # Price-based triggers
├── oracle/
│   └── price-fetcher.ts           # Price data
└── executor/
    └── swap-executor.ts           # DEX swaps
```

### **Dashboard Structure** (To Create)

```
dashboard/                          # New folder
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Overview page
│   ├── portfolio/
│   │   └── page.tsx              # Portfolio page
│   ├── triggers/
│   │   └── page.tsx              # Triggers page
│   ├── scheduler/
│   │   └── page.tsx              # Scheduler page
│   ├── activity/
│   │   └── page.tsx              # Activity log
│   └── api/                       # API routes
│       ├── status/
│       ├── portfolio/
│       ├── triggers/
│       ├── jobs/
│       └── activity/
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── charts/                    # Chart components
│   ├── cards/                     # Card components
│   └── layout/                    # Layout components
├── lib/
│   ├── agent-client.ts            # Client to connect to agent
│   └── utils.ts                   # Utility functions
└── public/                        # Static assets
```

---

## **🔗 Resources**

### **Documentation**
- Agent docs: `docs/ARCHITECTURE.md` - Complete system design
- API design: Create endpoints based on existing classes
- Code: All in `src/` folder

### **Design Inspiration**
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Grafana](https://grafana.com)
- [shadcn/ui examples](https://ui.shadcn.com/examples/dashboard)

### **Libraries**
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Recharts](https://recharts.org) - Charts
- [date-fns](https://date-fns.org) - Date formatting
- [React Query](https://tanstack.com/query) - Data fetching

---

## **💡 Tips & Best Practices**

1. **Start Simple**: Build Overview page first, then iterate
2. **Use Mock Data**: Create mock API responses to develop UI independently
3. **Real-time First**: Implement WebSocket or polling early
4. **Mobile Responsive**: Design mobile-first, scale up
5. **Performance**: Use React.memo, lazy loading for charts
6. **Error Handling**: Show loading states and error messages
7. **Accessibility**: Use semantic HTML, ARIA labels
8. **Type Safety**: Use TypeScript throughout

---

## **🎨 Example Component Structure**

### **PortfolioCard Component**

```typescript
interface PortfolioCardProps {
  totalValue: number;
  allocation: {
    ETH: number;
    USDC: number;
  };
  drift: number;
  lastRebalance: Date;
}

export function PortfolioCard({
  totalValue,
  allocation,
  drift,
  lastRebalance
}: PortfolioCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          ${totalValue.toLocaleString()}
        </div>
        <AllocationChart data={allocation} />
        <DriftIndicator value={drift} threshold={5} />
        <p className="text-sm text-muted">
          Last rebalance: {formatDistanceToNow(lastRebalance)} ago
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## **✅ Acceptance Criteria**

Your dashboard is complete when:

1. ✅ All 5 core pages are functional
2. ✅ Real-time data updates work
3. ✅ Charts display portfolio and price data
4. ✅ Triggers show progress to threshold
5. ✅ Activity log is searchable/filterable
6. ✅ Responsive design works on mobile
7. ✅ Dark theme looks professional
8. ✅ Loading states and errors handled
9. ✅ Code is clean and documented
10. ✅ README with setup instructions

---

## **🚀 Getting Started**

1. **Read Architecture**: Review `docs/ARCHITECTURE.md`
2. **Understand Agent**: Look at `src/agent/recurring-executor.ts`
3. **Plan API**: Design API endpoints based on existing methods
4. **Start Building**: Create Next.js project, setup shadcn/ui
5. **Iterate**: Build one page at a time, test with mock data
6. **Integrate**: Connect to real agent via API
7. **Polish**: Add animations, responsive design, error handling

---

## **📞 Questions?**

If you need clarification:
- Check `docs/ARCHITECTURE.md` for system design
- Review existing code in `src/` for data structures
- Look at `docs/PHASE_4_COMPLETE.md` for test examples

---

<div align="center">

**Build an amazing dashboard!** 🎨

The agent is production-ready - now give it a beautiful interface! 🚀

</div>

