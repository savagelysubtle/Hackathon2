import { NextResponse } from 'next/server';
import { spaceManager } from '@/lib/warden-spaces';

/**
 * GET /api/spaces/balance?spaceId=space_123
 * Get balance for a Space
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');

    if (!spaceId) {
      return NextResponse.json(
        { error: 'spaceId is required' },
        { status: 400 },
      );
    }

    const balances = await spaceManager.getSpaceBalance(spaceId);

    return NextResponse.json({
      success: true,
      spaceId,
      balances,
    });
  } catch (error) {
    console.error('Error fetching Space balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Space balance' },
      { status: 500 },
    );
  }
}
