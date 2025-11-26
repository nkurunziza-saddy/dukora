import { type NextRequest, NextResponse } from "next/server";
import { ERROR_CODE } from "@/server/constants/errors";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(ERROR_CODE.UNAUTHORIZED, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
