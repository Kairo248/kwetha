import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { getOrderByPaymentReference } from "@/lib/repositories/platform";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ message: "Payment reference is required." }, { status: 400 });
  }

  const verification = await verifyPaystackTransaction(reference);
  const order = await getOrderByPaymentReference(reference);

  return NextResponse.json({ verification, order });
}