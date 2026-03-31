import { NextResponse } from "next/server";
import { getTicketRecordByReference } from "@/lib/repositories/platform";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ticketValidationSchema } from "@/lib/schemas";
import { normalizeTicketScanInput } from "@/lib/ticket-scan";
import { getTicketValidationMessage } from "@/lib/ticketing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.json();
  const parsed = ticketValidationSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const ticketReference = normalizeTicketScanInput(parsed.data.code);
  if (ticketReference.length < 6) {
    return NextResponse.json({ message: "Ticket reference is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.rpc("validate_ticket_scan", {
      p_ticket_reference: ticketReference,
      p_event_id: parsed.data.eventId || null,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({
      message: "Ticket validated and marked as used.",
      ticket: data,
    });
  }

  const ticket = await getTicketRecordByReference(ticketReference);

  if (!ticket) {
    return NextResponse.json({ message: "Ticket not found." }, { status: 404 });
  }

  if (parsed.data.eventId && parsed.data.eventId !== ticket.eventId) {
    return NextResponse.json({ message: "Ticket does not belong to this event." }, { status: 409 });
  }

  if (ticket.status !== "valid") {
    return NextResponse.json({ message: getTicketValidationMessage(ticket.status) }, { status: 409 });
  }

  return NextResponse.json({
    message: getTicketValidationMessage(ticket.status),
    ticket,
  });
}