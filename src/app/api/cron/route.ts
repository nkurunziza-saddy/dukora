import { type NextRequest, NextResponse } from "next/server";
import { ErrorCode } from "@/server/constants/errors";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(ErrorCode.UNAUTHORIZED, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
