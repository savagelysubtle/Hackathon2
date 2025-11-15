import { NextResponse } from "next/server";
import { spaceManager } from "@/lib/warden-spaces";

/**
 * POST /api/spaces/execute
 * Execute an action on a Space
 */
export async function POST(request: Request) {
  try {
    const { spaceId, action, params } = await request.json();

    if (!spaceId || !action) {
      return NextResponse.json(
        { error: "spaceId and action are required" },
        { status: 400 }
      );
    }

    const txHash = await spaceManager.executeOnSpace(spaceId, {
      type: action,
      params,
    });

    return NextResponse.json({
      success: true,
      txHash,
      message: `Action ${action} executed successfully`,
    });
  } catch (error) {
    console.error("Error executing on Space:", error);
    return NextResponse.json(
      { error: "Failed to execute on Space", details: (error as Error).message },
      { status: 500 }
    );
  }
}

