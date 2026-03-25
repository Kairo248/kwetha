import crypto from "node:crypto";
import { env } from "@/lib/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackInitializePayload = {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
};

export type PaystackVerificationData = {
  status: string;
  reference: string;
  amount: number;
  paid_at?: string;
  customer?: {
    email?: string;
  };
  metadata?: Record<string, unknown>;
};

export async function initializePaystackTransaction(payload: PaystackInitializePayload) {
  if (!env.paystackSecretKey) {
    return {
      status: true,
      message: "Paystack not configured. Returning preview checkout payload.",
      data: {
        authorization_url: `${env.appUrl ?? "http://localhost:3000"}/store?previewCheckout=1`,
        access_code: "preview_access_code",
        reference: payload.reference,
      },
    };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize Paystack transaction.");
  }

  return response.json();
}

export async function verifyPaystackTransaction(reference: string) {
  if (!env.paystackSecretKey) {
    return {
      status: true,
      message: "Paystack not configured. Returning preview verification payload.",
      data: {
        status: "success",
        reference,
        amount: 0,
        customer: { email: undefined },
        metadata: { preview: true },
      } satisfies PaystackVerificationData,
    };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to verify Paystack transaction.");
  }

  return response.json() as Promise<{
    status: boolean;
    message: string;
    data: PaystackVerificationData;
  }>;
}

export function verifyPaystackSignature(body: string, signature: string | null) {
  if (!env.paystackSecretKey || !signature) {
    return false;
  }

  const hash = crypto.createHmac("sha512", env.paystackSecretKey).update(body).digest("hex");
  return hash === signature;
}