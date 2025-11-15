import { NextResponse } from "next/server";
import { spaceManager } from "@/lib/warden-spaces";

/**
 * POST /api/spaces/create
 * Create a new Warden Space for a user
 */
export async function POST(request: Request) {
  try {
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      );
    }

    // Check if user already has a Space
    if (spaceManager.hasSpace(userAddress)) {
      const existingSpace = spaceManager.getSpaceForUser(userAddress);
      return NextResponse.json({
        success: true,
        space: existingSpace,
        message: "Space already exists for this user",
      });
    }

    // Create new Space
    const space = await spaceManager.createSpaceForUser(userAddress);

    // Get deposit instructions
    const depositInstructions = spaceManager.getDepositInstructions(space);

    return NextResponse.json({
      success: true,
      space,
      depositInstructions,
    });
  } catch (error) {
    console.error("Error creating Space:", error);
    return NextResponse.json(
      { error: "Failed to create Space", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/spaces/create?userAddress=0x...
 * Get Space for a user if it exists
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      );
    }

    const space = spaceManager.getSpaceForUser(userAddress);

    if (!space) {
      return NextResponse.json(
        { error: "Space not found", hasSpace: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      space,
      hasSpace: true,
    });
  } catch (error) {
    console.error("Error fetching Space:", error);
    return NextResponse.json(
      { error: "Failed to fetch Space" },
      { status: 500 }
    );
  }
}

