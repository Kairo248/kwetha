"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ticketValidationSchema, type TicketValidationInput } from "@/lib/schemas";

export function TicketScanner() {
  const form = useForm<TicketValidationInput>({
    resolver: zodResolver(ticketValidationSchema),
    defaultValues: {
      code: "",
      eventId: "",
    },
  });

  const onSubmit = async (values: TicketValidationInput) => {
    const response = await fetch("/api/tickets/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { message?: string; ticket?: { status: string } };

    if (!response.ok) {
      toast.error("Scan rejected", { description: payload.message ?? "Unable to validate ticket." });
      return;
    }

    toast.success("Ticket validated", {
      description: payload.message ?? `Ticket status: ${payload.ticket?.status ?? "valid"}`,
    });
    form.reset();
  };

  return (
    <section className="glass-panel rounded-4xl p-8 md:p-10">
      <p className="eyebrow mb-4">Mobile-Friendly Scan Station</p>
      <h2 className="display-title text-4xl leading-none sm:text-5xl">Validate entry without duplicate admissions.</h2>
      <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
        Enter a QR-decoded ticket reference or wire this form to a camera scanner on mobile.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Input label="Ticket reference" placeholder="IKW-2026-0001" {...form.register("code")} />
        <Input label="Event ID" placeholder="Optional event UUID" {...form.register("eventId")} />
        <Button type="submit">Validate ticket</Button>
      </form>
    </section>
  );
}