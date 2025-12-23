import { NextResponse } from 'next/server';

// Mock Oracle Data - this will be replaced with Warden Oracle
export async function POST(request: Request) {
  try {
    const { pairs } = await request.json();

    if (!Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid pairs parameter' },
        { status: 400 },
      );
    }

    // TODO: Integrate with actual Warden Oracle from /src/oracle/price-fetcher.ts
    // For now, return mock prices
    const mockPrices: Record<string, number> = {
      'ETH/USD': 3500.0,
      'USDC/USD': 1.0,
      'USDT/USD': 1.0,
      'DAI/USD': 1.0,
      'SOL/USD': 220.0,
      'BTC/USD': 65000.0,
    };

    const prices: Record<string, number> = {};
    for (const pair of pairs) {
      prices[pair] = mockPrices[pair] || 0;
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 },
    );
  }
}

// GET endpoint for backward compatibility
export async function GET() {
  // Mock data
  const prices = {
    ETH: {
      price: 3500.0,
      change24h: 2.5,
      timestamp: new Date().toISOString(),
    },
    USDC: {
      price: 1.0,
      change24h: 0.0,
      timestamp: new Date().toISOString(),
    },
    SOL: {
      price: 215.0,
      change24h: 7.5,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(prices);
}
