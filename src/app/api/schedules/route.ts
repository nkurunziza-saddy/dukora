import { NextRequest, NextResponse } from "next/server";
import * as schedulesService from "@/server/actions/schedule-actions";

export async function GET() {
  try {
    const schedules = await schedulesService.getSchedules({});
    return NextResponse.json(schedules.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get schedules", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const schedules = await request.json();
    const newSchedules = await schedulesService.createSchedule(schedules);
    return NextResponse.json(newSchedules);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create schedules", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { schedules, schedulesId } = await request.json();
    const updatedSchedules = await schedulesService.updateSchedule({
      scheduleId: schedulesId,
      updates: schedules,
    });
    return NextResponse.json(updatedSchedules);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update schedules", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await schedulesService.deleteSchedule(id);
    if (r.error) {
      return NextResponse.json(r.error);
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting schedules:", error);
    return NextResponse.json("Failed to delete schedules", { status: 500 });
  }
}
