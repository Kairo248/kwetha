import crypto from "node:crypto";
import { env } from "@/lib/env";
import { finalizeSuccessfulPayment } from "@/lib/orders";
import {
  initializePaystackTransaction,
  verifyPaystackSignature,
} from "@/lib/payments/paystack";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PendingOrderLineItem = {
  itemId: string;
  quantity: number;
  unitPriceCents: number;
};

type CreatePendingOrderParams = {
  userId: string | null;
  email: string;
  amountCents: number;
  kind: "ticket" | "product" | "store";
  callbackUrl?: string;
  metadata: Record<string, unknown>;
  lineItems?: PendingOrderLineItem[];
};

type InitializedPayment = {
  orderId: string | null;
  reference: string;
  authorizationUrl: string;
  accessCode: string | null;
  raw: {
    status?: boolean;
    message?: string;
    data?: {
      authorization_url?: string;
      access_code?: string;
      reference?: string;
    };
  };
};

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    amount?: number;
    reference?: string;
    status?: string;
    customer?: {
      email?: string;
    };
  };
};

function buildMetadata(input: Record<string, unknown>) {
  return {
    ...input,
    paymentProvider: "paystack",
    schemaVersion: 2,
  };
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export function generatePaymentReference(now = new Date()) {
  const year = now.getUTCFullYear();
  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `IKW-${year}-${token}`;
}

async function markOrderInitializationFailed(orderId: string, reason: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("metadata")
    .eq("id", orderId)
    .maybeSingle();

  const metadata = (existingOrder?.metadata ?? {}) as Record<string, unknown>;

  await supabase
    .from("orders")
    .update({
      status: "failed",
      metadata: {
        ...metadata,
        paymentInitializationFailedAt: new Date().toISOString(),
        paymentInitializationError: reason,
      },
    })
    .eq("id", orderId);
}

export async function createPendingOrderAndInitializePayment(
  input: CreatePendingOrderParams,
): Promise<InitializedPayment> {
  const supabase = createSupabaseAdminClient();
  const reference = generatePaymentReference();
  const metadata = buildMetadata(input.metadata);
  let orderId: string | null = null;

  if (supabase) {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        payment_reference: reference,
        user_id: input.userId,
        status: "pending",
        subtotal_cents: input.amountCents,
        total_cents: input.amountCents,
        metadata,
      })
      .select("id")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    orderId = order.id;

    if (input.lineItems?.length) {
      const { error: lineItemError } = await supabase.from("order_items").insert(
        input.lineItems.map((lineItem) => ({
          order_id: order.id,
          item_id: lineItem.itemId,
          quantity: lineItem.quantity,
          unit_price_cents: lineItem.unitPriceCents,
        })),
      );

      if (lineItemError) {
        await markOrderInitializationFailed(order.id, lineItemError.message);
        throw new Error(lineItemError.message);
      }
    }
  } else if (env.paystackSecretKey) {
    throw new Error("Supabase admin configuration is required before payments can be initialized.");
  }

  try {
    const payload = await initializePaystackTransaction({
      email: input.email,
      amount: input.amountCents,
      reference,
      callback_url:
        input.callbackUrl ?? `${env.appUrl ?? "http://localhost:3000"}/checkout/complete?reference=${reference}`,
      metadata: {
        ...metadata,
        orderId,
      },
    });

    return {
      orderId,
      reference,
      authorizationUrl: payload.data.authorization_url,
      accessCode: payload.data.access_code ?? null,
      raw: payload,
    };
  } catch (error) {
    if (orderId) {
      await markOrderInitializationFailed(
        orderId,
        error instanceof Error ? error.message : "Failed to initialize Paystack payment.",
      );
    }

    throw error;
  }
}

async function recordProcessedTransaction(input: {
  orderId: string;
  reference: string;
  amountCents: number;
  customerEmail: string | null;
  payload: unknown;
}) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { duplicate: false };
  }

  const { error } = await supabase.from("payment_transactions").insert({
    order_id: input.orderId,
    provider: "paystack",
    event_type: "charge.success",
    provider_reference: input.reference,
    provider_status: "success",
    amount_cents: input.amountCents,
    customer_email: input.customerEmail,
    payload:
      input.payload && typeof input.payload === "object"
        ? input.payload
        : { reference: input.reference },
    processed_at: new Date().toISOString(),
  });

  if (!error) {
    return { duplicate: false };
  }

  if (isUniqueViolation(error)) {
    return { duplicate: true };
  }

  throw new Error(error.message);
}

async function hasProcessedTransaction(reference: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("payment_transactions")
    .select("id")
    .eq("provider", "paystack")
    .eq("event_type", "charge.success")
    .eq("provider_reference", reference)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.id);
}

export async function handlePaystackWebhookRequest(request: Request) {
  const signature = request.headers.get("x-paystack-signature");
  const body = await request.text();

  if (!verifyPaystackSignature(body, signature)) {
    return Response.json({ message: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(body) as PaystackWebhookEvent;

  if (event.event !== "charge.success" || !event.data?.reference) {
    return Response.json({
      received: true,
      message: `Ignored webhook event ${event.event ?? "unknown"}.`,
    });
  }

  try {
    if (await hasProcessedTransaction(event.data.reference)) {
      return Response.json({
        received: true,
        message: "Payment already processed.",
        reference: event.data.reference,
      });
    }

    const result = await finalizeSuccessfulPayment(event.data.reference, {
      verifiedAmountCents: event.data.amount,
      verifiedCustomerEmail: event.data.customer?.email ?? null,
      providerEvent: event.event,
      providerPayload: event,
    });

    await recordProcessedTransaction({
      orderId: result.orderId,
      reference: event.data.reference,
      amountCents: result.amount,
      customerEmail: event.data.customer?.email ?? null,
      payload: event,
    });

    return Response.json({
      received: true,
      message: result.processed ? "Payment verified and processed." : "Payment already processed.",
      reference: event.data.reference,
      result,
    });
  } catch (error) {
    return Response.json(
      {
        received: true,
        reference: event.data.reference,
        message: error instanceof Error ? error.message : "Webhook processing failed.",
      },
      { status: 500 },
    );
  }
}