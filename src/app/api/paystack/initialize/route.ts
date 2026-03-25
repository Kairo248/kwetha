import { NextResponse } from "next/server";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { checkoutSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.json();
  const parsed = checkoutSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const payload = await initializePaystackTransaction({
      email: parsed.data.email,
      amount: Math.round(parsed.data.amount * 100),
      reference: parsed.data.reference,
      callback_url: parsed.data.callbackUrl,
      metadata: parsed.data.metadata,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to initialize payment.",
      },
      { status: 500 },
    );
  }
}