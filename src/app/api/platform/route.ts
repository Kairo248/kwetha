import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/repositories/platform";

export async function GET() {
  const snapshot = await getDashboardMetrics();
  return NextResponse.json(snapshot);
}