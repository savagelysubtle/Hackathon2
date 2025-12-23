import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const triggers = await agentService.getTriggers();

    // Simulate current prices and progress
    const triggersWithProgress = triggers.map((trigger) => {
      const baselinePrice = trigger.baselinePrice;
      const currentPrice = baselinePrice * (1 + (Math.random() * 0.15 - 0.025)); // ±2.5% variation
      const priceDiff = ((currentPrice - baselinePrice) / baselinePrice) * 100;
      const progress = Math.abs(priceDiff / trigger.thresholdPercentage) * 100;

      return {
        ...trigger,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        progress: parseFloat(progress.toFixed(1)),
        lastChecked: new Date().toISOString(),
      };
    });

    return NextResponse.json({ triggers: triggersWithProgress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.currencyPair ||
      !body.thresholdPercentage ||
      !body.actionPercentage
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Get current price as baseline if not provided
    const baselinePrice = body.baselinePrice || 200; // TODO: Fetch actual current price

    const triggerId = await agentService.createTrigger({
      currencyPair: body.currencyPair,
      baselinePrice,
      thresholdPercentage: body.thresholdPercentage,
      actionPercentage: body.actionPercentage,
      direction: body.direction || 'above',
      isActive: true,
    });

    return NextResponse.json({ success: true, triggerId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
