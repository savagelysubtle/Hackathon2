# 🎨 Recurring Executor Agent Dashboard

A modern, real-time monitoring dashboard for the Recurring Executor Agent - a DeFi portfolio automation system built with Warden Protocol.

![Dashboard Preview](https://img.shields.io/badge/Status-Production_Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Overview

This dashboard provides real-time visualization and monitoring of:

- 💰 **Portfolio Management** - Track asset allocations and portfolio value
- 🎯 **Price Triggers** - Monitor automated trading triggers
- 📅 **Scheduled Jobs** - View cron jobs and execution history
- 📊 **Activity Logs** - Comprehensive execution history
- ⚙️ **Agent Settings** - Configure agent parameters

## 🚀 Features

### Core Pages

1. **Overview** 📈
   - Real-time portfolio value
   - Current allocation vs target
   - Active triggers status
   - Recent activity feed

2. **Portfolio** 💼
   - Asset breakdown with live prices
   - Allocation charts (pie/donut)
   - Portfolio history graphs
   - Rebalance timeline

3. **Triggers** 🎯
   - Active price trigger cards
   - Progress to threshold
   - Real-time price charts
   - Trigger execution history

4. **Scheduler** 📅
   - Scheduled job listings
   - Execution statistics
   - Success rate monitoring
   - Recent execution logs

5. **Activity** 📝
   - Filterable activity feed
   - Transaction history
   - Performance metrics
   - Export capabilities

6. **Settings** ⚙️
   - Portfolio configuration
   - Trigger management
   - Connection settings
   - Agent controls

### Technical Features

- ✅ **Real-time Updates** - Live data refresh
- ✅ **Dark Mode** - Professional dark theme
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Modern UI** - Built with shadcn/ui
- ✅ **Fast Performance** - Optimized with Next.js 14

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Date Formatting**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun
- The Recurring Executor Agent (located in `../` directory)

### Setup Steps

1. **Navigate to the dashboard directory:**

```bash
cd dashboard
```

2. **Install dependencies:**

```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

3. **Configure environment variables:**

Create a `.env.local` file:

```env
# API Configuration (optional)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

4. **Start the development server:**

```bash
# Using bun
bun dev

# Or using npm
npm run dev
```

5. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
dashboard/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with sidebar
│   ├── page.tsx                 # Overview page
│   ├── portfolio/
│   │   └── page.tsx            # Portfolio page
│   ├── triggers/
│   │   └── page.tsx            # Triggers page
│   ├── scheduler/
│   │   └── page.tsx            # Scheduler page
│   ├── activity/
│   │   └── page.tsx            # Activity log page
│   ├── settings/
│   │   └── page.tsx            # Settings page
│   ├── api/                     # API routes
│   │   ├── status/
│   │   ├── portfolio/
│   │   ├── triggers/
│   │   ├── jobs/
│   │   ├── activity/
│   │   ├── prices/
│   │   └── health/
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── layout/                  # Layout components
│       ├── sidebar.tsx          # Navigation sidebar
│       └── header.tsx           # Top header
├── lib/
│   ├── agent-client.ts          # API client
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets
```

## 🔌 API Integration

### API Endpoints

The dashboard connects to the agent via REST API endpoints:

```typescript
GET /api/status              // Agent status and overview
GET /api/portfolio           // Current portfolio state
GET /api/portfolio/history   // Historical snapshots
GET /api/triggers            // Active triggers
GET /api/jobs                // Scheduled jobs
GET /api/activity            // Activity feed
GET /api/prices              // Current prices
GET /api/health              // Health check
```

### Using the API Client

```typescript
import { agentClient } from "@/lib/agent-client";

// Fetch agent status
const status = await agentClient.getStatus();

// Fetch portfolio data
const portfolio = await agentClient.getPortfolio();

// Fetch triggers
const { triggers } = await agentClient.getTriggers();
```

## 🎨 Customization

### Colors

Edit `app/globals.css` to customize the color scheme:

```css
.dark {
  --background: 222.2 84% 4.9%;     /* Dark navy background */
  --primary: 217.2 91.2% 59.8%;     /* Electric blue */
  --destructive: 0 62.8% 30.6%;     /* Red for errors */
  /* ... more colors */
}
```

### Components

All UI components are located in `components/ui/` and can be customized:

```bash
# Add more shadcn/ui components
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add tabs
```

## 📊 Data Flow

1. **Frontend** fetches data from API routes (`/api/*`)
2. **API Routes** return mock data (or connect to agent in production)
3. **Agent Client** (`lib/agent-client.ts`) handles all API calls
4. **Pages** use the client to fetch and display data

## 🚀 Production Deployment

### Build for Production

```bash
# Using bun
bun run build

# Or using npm
npm run build
```

### Start Production Server

```bash
# Using bun
bun start

# Or using npm
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🔧 Development

### Adding New Pages

1. Create a new folder in `app/`
2. Add a `page.tsx` file
3. Update the sidebar navigation in `components/layout/sidebar.tsx`

### Adding New API Routes

1. Create a new folder in `app/api/`
2. Add a `route.ts` file with GET/POST handlers
3. Update `lib/agent-client.ts` with new methods

### Styling Guidelines

- Use Tailwind utility classes
- Follow shadcn/ui component patterns
- Maintain dark mode compatibility
- Keep components responsive

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill the process using port 3000
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use a different port
PORT=3001 bun dev
```

### API Connection Issues

- Verify the agent is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Ensure CORS is configured if using external API

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for the [Warden Protocol](https://wardenprotocol.org/) hackathon
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For questions or issues:
- Check the main project README: `../README.md`
- Review architecture docs: `../docs/ARCHITECTURE.md`
- Open an issue on GitHub

---

<div align="center">

**Built with ❤️ for the Recurring Executor Agent**

[Documentation](../docs/) • [Agent README](../README.md) • [Architecture](../docs/ARCHITECTURE.md)

</div>
