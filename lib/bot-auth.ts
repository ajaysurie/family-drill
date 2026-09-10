import { NextResponse } from "next/server";

export function requireBotToken(request: Request) {
  const token = process.env.FAMILY_DRILL_BOT_TOKEN;
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
