import { type NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/server/actions/users/users-actions";
import { ERROR_CODE } from "@/server/constants/errors";

export async function GET(
  _request: NextRequest,
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
    return NextResponse.json(ERROR_CODE.DATABASE_ERROR, {
      status: 500,
    });
  }
}
