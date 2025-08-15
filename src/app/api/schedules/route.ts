import { NextRequest, NextResponse } from "next/server";
import * as schedulesService from "@/server/actions/schedule-actions";
import { ErrorCode } from "@/server/constants/errors";

export async function GET() {
  try {
    const schedules = await schedulesService.getSchedules({});
    if (schedules.error) {
      return NextResponse.json(schedules.error, { status: 500 });
    }
    return NextResponse.json(schedules.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const schedules = await request.json();
    const newSchedules = await schedulesService.createSchedule(schedules);
    if (newSchedules.error) {
      return NextResponse.json(newSchedules.error, { status: 500 });
    }
    return NextResponse.json(newSchedules);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { schedules, schedulesId } = await request.json();
    const updatedSchedules = await schedulesService.updateSchedule({
      scheduleId: schedulesId,
      updates: schedules,
    });
    if (updatedSchedules.error) {
      return NextResponse.json(updatedSchedules.error, { status: 500 });
    }
    return NextResponse.json(updatedSchedules);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await schedulesService.deleteSchedule(id);
    if (r.error) {
      return NextResponse.json(r.error, { status: 500 });
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting schedules:", error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}
