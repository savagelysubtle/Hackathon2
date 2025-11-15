# 🚀 Dashboard Quick Start Guide

## Getting Started in 3 Steps

### 1️⃣ Install Dependencies

```bash
cd dashboard
bun install
```

### 2️⃣ Start Development Server

```bash
bun dev
```

### 3️⃣ Open Dashboard

Navigate to: **http://localhost:3000**

---

## 📱 Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| **Overview** | `/` | Agent status, portfolio value, active triggers |
| **Portfolio** | `/portfolio` | Asset breakdown, allocation charts, history |
| **Triggers** | `/triggers` | Price triggers, execution progress |
| **Scheduler** | `/scheduler` | Cron jobs, execution logs |
| **Activity** | `/activity` | Complete execution history |
| **Settings** | `/settings` | Agent configuration |

---

## 🎨 Key Features

- ✅ **Real-time Updates** - Data refreshes automatically
- ✅ **Dark Mode** - Professional dark theme enabled
- ✅ **Responsive** - Works on desktop, tablet, and mobile
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Fast** - Optimized with Next.js 14

---

## 📊 Current Status

The dashboard is using **mock data** for development. To connect to the real agent:

1. Update API routes in `app/api/*/route.ts`
2. Import and use the actual agent classes:
   ```typescript
   import { RecurringExecutorAgent } from '../../../src/agent/recurring-executor';
   ```
3. Call agent methods to get real-time data

---

## 🛠️ Common Commands

```bash
# Development
bun dev              # Start dev server
bun run build        # Build for production
bun start            # Start production server

# Add Components
bunx shadcn@latest add [component]

# Clean Build
rm -rf .next && bun dev
```

---

## 🎯 Next Steps

1. **Connect to Real Agent** - Replace mock data with actual agent integration
2. **Add Real-time Updates** - Implement WebSocket or polling
3. **Add Authentication** - Secure the dashboard
4. **Deploy** - Deploy to Vercel or your hosting provider

---

## 📚 Documentation

- Full README: `dashboard/README.md`
- Agent Docs: `../docs/ARCHITECTURE.md`
- API Reference: See `lib/agent-client.ts`

---

<div align="center">

**Happy Monitoring! 🎉**

</div>

