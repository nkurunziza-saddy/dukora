import { type NextRequest, NextResponse } from "next/server";
import * as userService from "@/server/actions/user-actions";
import { ErrorCode } from "@/server/constants/errors";

export async function GET() {
  try {
    const users = await userService.getUsers({});
    if (users.error) {
      return NextResponse.json(users.error, { status: 500 });
    }
    return NextResponse.json(users.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();
    const newUser = await userService.createUser(user);
    if (newUser.error) {
      return NextResponse.json(newUser.error, { status: 500 });
    }
    return NextResponse.json(newUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, userId } = await request.json();
    const updatedUser = await userService.updateUser({
      userId: userId,
      userData: user,
    });
    if (updatedUser.error) {
      return NextResponse.json(updatedUser.error, { status: 500 });
    }
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await userService.deleteUser(id);
    if (r.error) {
      return NextResponse.json(r.error, { status: 500 });
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}
