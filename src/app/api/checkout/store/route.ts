import { NextResponse } from "next/server";
import { getViewerState } from "@/lib/auth";
import { createPendingOrderAndInitializePayment } from "@/lib/payments/payment-flow";
import { getProducts } from "@/lib/repositories/platform";
import { storeCheckoutSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ message: "Sign in before starting checkout." }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = storeCheckoutSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const products = await getProducts();
  const lineItems = parsed.data.items.map((item) => {
    const product = products.items.find((entry) => entry.id === item.id);
    return product ? { product, quantity: item.quantity } : null;
  }).filter(Boolean);

  if (!lineItems.length) {
    return NextResponse.json({ message: "No valid products selected for checkout." }, { status: 400 });
  }

  const subtotalCents = lineItems.reduce((sum, entry) => sum + entry!.product.price * 100 * entry!.quantity, 0);
  try {
    const payment = await createPendingOrderAndInitializePayment({
      userId: viewer.user.id,
      email: viewer.user.email ?? parsed.data.email,
      amountCents: subtotalCents,
      kind: "store",
      callbackUrl: parsed.data.callbackUrl,
      metadata: {
        kind: "store",
        email: viewer.user.email ?? parsed.data.email,
        customerName: viewer.profile?.fullName ?? parsed.data.customerName ?? viewer.user.email,
        items: parsed.data.items,
        userId: viewer.user.id,
      },
      lineItems: lineItems.map((entry) => ({
        itemId: entry!.product.id,
        quantity: entry!.quantity,
        unitPriceCents: Math.round(entry!.product.price * 100),
      })),
    });

    return NextResponse.json({
      status: true,
      orderId: payment.orderId,
      reference: payment.reference,
      data: {
        authorization_url: payment.authorizationUrl,
        access_code: payment.accessCode,
        reference: payment.reference,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to initialize checkout.",
      },
      { status: 500 },
    );
  }
}