import { buildOrderEmailHtml, buildTicketEmailHtml, sendTransactionalEmail } from "@/lib/email";
import { generateTicketQrDataUrl } from "@/lib/qr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTicketRecordByReference } from "@/lib/repositories/platform";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import type { TicketRecord } from "@/types/domain";

type FinalizedOrderResult = {
  orderId: string;
  status: string;
  kind: string;
  amount: number;
  ticket?: TicketRecord | null;
  qrCodeDataUrl?: string | null;
  processed: boolean;
};

type FinalizeSuccessfulPaymentOptions = {
  verifiedAmountCents?: number;
  verifiedCustomerEmail?: string | null;
  providerEvent?: string;
  providerPayload?: unknown;
};

function formatRandFromCents(value: number) {
  return `R ${(value / 100).toFixed(2)}`;
}

function getOrderMetadata(metadata: unknown) {
  return (metadata ?? {}) as Record<string, unknown>;
}

function isProcessedOrderStatus(status: string) {
  return status === "paid" || status === "fulfilled";
}

function getEmailSentAt(metadata: Record<string, unknown>) {
  return typeof metadata.confirmationEmailSentAt === "string"
    ? metadata.confirmationEmailSentAt
    : null;
}

function resolveCustomerEmail(
  metadata: Record<string, unknown>,
  verifiedCustomerEmail?: string | null,
) {
  if (typeof metadata.email === "string" && metadata.email.length > 0) {
    return metadata.email;
  }

  if (typeof verifiedCustomerEmail === "string" && verifiedCustomerEmail.length > 0) {
    return verifiedCustomerEmail;
  }

  if (typeof metadata.customerEmail === "string" && metadata.customerEmail.length > 0) {
    return metadata.customerEmail;
  }

  return "";
}

async function updateOrderState(input: {
  orderId: string;
  metadata: Record<string, unknown>;
  status?: string;
}) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("orders")
    .update({
      metadata: input.metadata,
      ...(input.status ? { status: input.status } : {}),
    })
    .eq("id", input.orderId);
}

export async function finalizeSuccessfulPayment(
  reference: string,
  options?: FinalizeSuccessfulPaymentOptions,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      orderId: reference,
      status: "paid",
      kind: "preview",
      amount: 0,
      ticket: null,
      qrCodeDataUrl: null,
      processed: true,
    } satisfies FinalizedOrderResult;
  }

  const verification = await verifyPaystackTransaction(reference);

  if (!verification.status || verification.data.status !== "success") {
    throw new Error("Paystack has not confirmed this payment as successful.");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total_cents, status, payment_reference, metadata")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error || !order) {
    throw new Error("Order record not found for this payment reference.");
  }

  const metadata = getOrderMetadata(order.metadata);
  const kind = String(metadata.kind ?? "order");
  const customerEmail = resolveCustomerEmail(metadata, options?.verifiedCustomerEmail);
  const customerName = String((metadata.customerName ?? metadata.fullName ?? customerEmail) || "Customer");

  if (verification.data.amount !== order.total_cents) {
    throw new Error("Verified payment amount does not match the pending order total.");
  }

  if (
    options?.verifiedAmountCents !== undefined &&
    options.verifiedAmountCents !== order.total_cents
  ) {
    throw new Error("Webhook payload amount does not match the pending order total.");
  }

  if (
    options?.verifiedCustomerEmail &&
    customerEmail &&
    options.verifiedCustomerEmail.toLowerCase() !== customerEmail.toLowerCase()
  ) {
    throw new Error("Webhook customer email does not match the saved order details.");
  }

  if (!isProcessedOrderStatus(order.status)) {
    await updateOrderState({
      orderId: order.id,
      status: "paid",
      metadata: {
        ...metadata,
        paymentVerifiedAt: verification.data.paid_at ?? new Date().toISOString(),
        paymentVerifiedStatus: verification.data.status,
        paymentVerificationReference: verification.data.reference,
        paymentProviderEvent: options?.providerEvent ?? "charge.success",
        lastVerifiedWebhookPayload:
          options?.providerPayload && typeof options.providerPayload === "object"
            ? options.providerPayload
            : { reference },
      },
    });
  }

  let ticket: TicketRecord | null = null;
  let qrCodeDataUrl: string | null = null;

  if (kind === "ticket") {
    const { data: existingLink } = await supabase
      .from("ticket_orders")
      .select("ticket_id")
      .eq("order_id", order.id)
      .maybeSingle();

    if (existingLink?.ticket_id) {
      const { data: existingTicket } = await supabase
        .from("tickets")
        .select("reference, qr_code_path")
        .eq("id", existingLink.ticket_id)
        .maybeSingle();

      if (existingTicket?.reference) {
        ticket = await getTicketRecordByReference(existingTicket.reference);
        qrCodeDataUrl = existingTicket.qr_code_path ?? null;
      }
    }

    if (!ticket) {
      const { data: createdTicket, error: ticketError } = await supabase.rpc("finalize_ticket_order", {
        p_order_id: order.id,
        p_event_id: String(metadata.eventId),
        p_user_id: metadata.userId ? String(metadata.userId) : null,
        p_attendee_name: String(metadata.fullName ?? customerName),
        p_attendee_email: customerEmail,
        p_date_of_birth: String(metadata.dob),
      });

      if (ticketError) {
        throw new Error(ticketError.message);
      }

      qrCodeDataUrl = await generateTicketQrDataUrl(createdTicket.reference);
      await supabase
        .from("tickets")
        .update({ qr_code_path: qrCodeDataUrl })
        .eq("id", createdTicket.id);

      ticket = await getTicketRecordByReference(createdTicket.reference);
    }
  } else {
    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
  }

  const confirmationEmailSentAt = getEmailSentAt(metadata);

  if (customerEmail && !confirmationEmailSentAt) {
    if (kind === "ticket" && ticket) {
      await sendTransactionalEmail({
        to: customerEmail,
        subject: "Your Ticket 🎟️",
        html: buildTicketEmailHtml({
          customerName,
          orderReference: order.payment_reference ?? order.id,
          eventTitle: ticket.eventTitle,
          ticketReference: ticket.reference,
          qrCodeDataUrl,
        }),
      });
    } else {
      await sendTransactionalEmail({
        to: customerEmail,
        subject: `Your Ikwetha order: ${order.payment_reference ?? order.id}`,
        html: buildOrderEmailHtml({
          customerName,
          orderReference: order.payment_reference ?? order.id,
          amount: formatRandFromCents(order.total_cents),
        }),
      });
    }

    await updateOrderState({
      orderId: order.id,
      metadata: {
        ...metadata,
        paymentVerifiedAt:
          typeof metadata.paymentVerifiedAt === "string"
            ? metadata.paymentVerifiedAt
            : verification.data.paid_at ?? new Date().toISOString(),
        paymentVerifiedStatus: verification.data.status,
        paymentVerificationReference: verification.data.reference,
        paymentProviderEvent: options?.providerEvent ?? "charge.success",
        confirmationEmailSentAt: new Date().toISOString(),
      },
    });
  }

  return {
    orderId: order.id,
    status: "paid",
    kind,
    amount: order.total_cents,
    ticket,
    qrCodeDataUrl,
    processed: true,
  } satisfies FinalizedOrderResult;
}