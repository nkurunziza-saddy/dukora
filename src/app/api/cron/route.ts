import { ErrorCode } from "@/server/constants/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(ErrorCode.UNAUTHORIZED, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
