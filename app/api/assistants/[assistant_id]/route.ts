import { NextResponse } from 'next/server';

// Mock assistant data - replace with actual LangGraph assistant info
const assistants = {
  'recurring_executor': {
    id: 'recurring_executor',
    name: 'Recurring Executor Agent',
    description: 'AI-powered DeFi portfolio automation with scheduled rebalancing, price-based triggers, and natural language control. Built for Warden Protocol Agent Hub.',
    model: 'gpt-4o-mini',
    tools: [
      'get_portfolio',
      'create_trigger',
      'check_triggers',
      'execute_swap',
      'check_rebalancing',
      'rebalance_portfolio',
      'get_price',
      'get_multiple_prices',
      'analyze_portfolio',
      'get_market_insights',
      'recommend_triggers',
      'get_execution_history'
    ],
    created_at: new Date().toISOString(),
  }
};

export async function GET(
  request: Request,
  { params }: { params: { assistant_id: string } }
) {
  const { assistant_id } = params;

  if (assistants[assistant_id as keyof typeof assistants]) {
    return NextResponse.json(assistants[assistant_id as keyof typeof assistants]);
  }

  return NextResponse.json(
    { error: 'Assistant not found' },
    { status: 404 }
  );
}