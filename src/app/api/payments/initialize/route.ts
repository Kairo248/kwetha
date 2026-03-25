import { NextResponse } from "next/server";
import { getViewerState } from "@/lib/auth";
import { createPendingOrderAndInitializePayment } from "@/lib/payments/payment-flow";
import { getEvents, getProducts } from "@/lib/repositories/platform";
import { paymentInitializationSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ message: "Sign in before starting payment." }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = paymentInitializationSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  if (viewer.user.id !== parsed.data.user_id) {
    return NextResponse.json({ message: "You can only initialize payments for your own account." }, { status: 403 });
  }

  if (parsed.data.type === "ticket") {
    const events = await getEvents();
    const event = events.items.find((entry) => entry.id === parsed.data.event_id);

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    const amountCents = Math.round(event.price * 100);

    if (parsed.data.amount !== amountCents) {
      return NextResponse.json({ message: "Ticket amount does not match the event pricing." }, { status: 400 });
    }

    const payment = await createPendingOrderAndInitializePayment({
      userId: viewer.user.id,
      email: viewer.user.email ?? "",
      amountCents,
      kind: "ticket",
      metadata: {
        kind: "ticket",
        eventId: event.id,
        eventTitle: event.title,
        email: viewer.user.email,
        userId: viewer.user.id,
      },
    });

    return NextResponse.json({
      order_id: payment.orderId,
      reference: payment.reference,
      authorization_url: payment.authorizationUrl,
      access_code: payment.accessCode,
    });
  }

  const products = await getProducts();
  const item = products.items.find((entry) => entry.id === parsed.data.item_id);

  if (!item) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const amountCents = Math.round(item.price * 100);

  if (parsed.data.amount !== amountCents) {
    return NextResponse.json({ message: "Product amount does not match the catalog pricing." }, { status: 400 });
  }

  const payment = await createPendingOrderAndInitializePayment({
    userId: viewer.user.id,
    email: viewer.user.email ?? "",
    amountCents,
    kind: "product",
    metadata: {
      kind: "product",
      itemId: item.id,
      itemTitle: item.title,
      email: viewer.user.email,
      customerName: viewer.profile?.fullName ?? viewer.user.email,
      userId: viewer.user.id,
    },
    lineItems: [
      {
        itemId: item.id,
        quantity: 1,
        unitPriceCents: amountCents,
      },
    ],
  });

  return NextResponse.json({
    order_id: payment.orderId,
    reference: payment.reference,
    authorization_url: payment.authorizationUrl,
    access_code: payment.accessCode,
  });
}