import { handlePaystackWebhookRequest } from "@/lib/payments/payment-flow";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handlePaystackWebhookRequest(request);
}