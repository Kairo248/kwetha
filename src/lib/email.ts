import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendTransactionalEmail(payload: EmailPayload) {
  if (!isResendConfigured || !env.resendApiKey || !env.resendFromEmail) {
    return { sent: false, provider: "preview" };
  }

  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: env.resendFromEmail,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return { sent: true, provider: "resend" };
}

export function buildOrderEmailHtml(input: {
  customerName: string;
  orderReference: string;
  amount: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172121;">
      <h1 style="margin-bottom: 12px;">Order confirmed</h1>
      <p>Hi ${input.customerName},</p>
      <p>Your payment has been received and your order is confirmed.</p>
      <p><strong>Reference:</strong> ${input.orderReference}</p>
      <p><strong>Total:</strong> ${input.amount}</p>
      <p>Thank you for supporting Ikwetha.</p>
    </div>
  `;
}

export function buildTicketEmailHtml(input: {
  customerName: string;
  orderReference: string;
  eventTitle: string;
  ticketReference: string;
  qrCodeDataUrl?: string | null;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172121;">
      <h1 style="margin-bottom: 12px;">Ticket confirmed</h1>
      <p>Hi ${input.customerName},</p>
      <p>Your ticket for <strong>${input.eventTitle}</strong> is confirmed.</p>
      <p><strong>Order:</strong> ${input.orderReference}</p>
      <p><strong>Ticket:</strong> ${input.ticketReference}</p>
      ${input.qrCodeDataUrl ? `<p><img src="${input.qrCodeDataUrl}" alt="Ticket QR code" width="220" height="220" /></p>` : ""}
      <p>Please keep this email available at entry.</p>
    </div>
  `;
}