import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/server/actions/user-actions";
import { ErrorCode } from "@/server/constants/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userDetails = await getUserById((await params).userId);
    if (userDetails.error) {
      return NextResponse.json(userDetails.error, { status: 500 });
    }
    return NextResponse.json(userDetails.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, {
      status: 500,
    });
  }
}
