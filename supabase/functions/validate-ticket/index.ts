import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ValidationPayload = {
  ticketReference: string;
  eventId?: string;
};

Deno.serve(async (request) => {
  const body = (await request.json()) as ValidationPayload;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase.rpc("validate_ticket_scan", {
    p_ticket_reference: body.ticketReference,
    p_event_id: body.eventId ?? null,
  });

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 409 });
  }

  return new Response(JSON.stringify({ ticket: data }), {
    headers: { "Content-Type": "application/json" },
  });
});