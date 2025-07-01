import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/server/actions/user-actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userDetails = await getUserById((await params).userId);
    return NextResponse.json(userDetails.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to fetch product details", {
      status: 500,
    });
  }
}
