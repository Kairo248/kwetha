import { NextResponse } from "next/server";
import { getViewerState } from "@/lib/auth";
import { createPendingOrderAndInitializePayment } from "@/lib/payments/payment-flow";
import { getEvents } from "@/lib/repositories/platform";
import { ticketCheckoutSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolveAudienceCategory } from "@/lib/ticketing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ message: "Sign in before purchasing an event ticket." }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = ticketCheckoutSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const events = await getEvents();
  const event = events.items.find((entry) => entry.id === parsed.data.eventId);

  if (!event) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const audienceCategory = resolveAudienceCategory(parsed.data.dob);
  const amountCents = Math.round(event.price * 100);
  const userId = viewer.user.id;

  if (supabase) {
    await supabase.from("profiles").upsert(
      {
        user_id: userId,
        full_name: parsed.data.fullName,
        date_of_birth: parsed.data.dob,
        city: parsed.data.city,
      },
      { onConflict: "user_id" },
    );
  }

  try {
    const payment = await createPendingOrderAndInitializePayment({
      userId,
      email: viewer.user.email ?? parsed.data.email,
      amountCents,
      kind: "ticket",
      callbackUrl: parsed.data.callbackUrl,
      metadata: {
        kind: "ticket",
        eventId: event.id,
        eventTitle: event.title,
        email: viewer.user.email ?? parsed.data.email,
        fullName: viewer.profile?.fullName ?? parsed.data.fullName,
        dob: parsed.data.dob,
        city: parsed.data.city,
        audienceCategory,
        userId,
      },
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
        message:
          error instanceof Error ? error.message : "Could not initialize ticket checkout.",
      },
      { status: 500 },
    );
  }
}