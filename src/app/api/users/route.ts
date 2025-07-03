import { NextRequest, NextResponse } from "next/server";
import * as userService from "@/server/actions/user-actions";

export async function GET() {
  try {
    const users = await userService.getUsers({});
    return NextResponse.json(users.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get users", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();
    const newUser = await userService.createUser(user);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create user", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, userId } = await request.json();
    const updatedUser = await userService.updateUser({
      userId: userId,
      userData: user,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update user", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await userService.deleteUser(id);
    if (r.error) {
      return NextResponse.json(r.error);
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json("Failed to delete user", { status: 500 });
  }
}
