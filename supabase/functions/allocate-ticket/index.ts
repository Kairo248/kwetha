import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AllocatePayload = {
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  dateOfBirth: string;
  paymentReference: string;
  amountCents: number;
};

Deno.serve(async (request) => {
  const body = (await request.json()) as AllocatePayload;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase.rpc("reserve_ticket", {
    p_event_id: body.eventId,
    p_user_id: body.userId,
    p_attendee_name: body.attendeeName,
    p_attendee_email: body.attendeeEmail,
    p_date_of_birth: body.dateOfBirth,
    p_payment_reference: body.paymentReference,
    p_amount_cents: body.amountCents,
  });

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 409 });
  }

  return new Response(JSON.stringify({ ticket: data }), {
    headers: { "Content-Type": "application/json" },
  });
});