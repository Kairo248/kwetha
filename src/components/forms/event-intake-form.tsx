"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { eventRegistrationSchema, type EventRegistrationInput } from "@/lib/schemas";
import { resolveAudienceCategory } from "@/lib/ticketing";
import type { PlatformEvent } from "@/types/domain";

type EventIntakeFormProps = {
  event: PlatformEvent;
};

export function EventIntakeForm({ event }: EventIntakeFormProps) {
  const [audience, setAudience] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EventRegistrationInput>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dob: "",
      city: "",
    },
  });

  const onSubmit = (values: EventRegistrationInput) => {
    startTransition(() => {
      const category = resolveAudienceCategory(values.dob);
      setAudience(category);
      toast.success("Category assigned", {
        description: `This attendee qualifies for the ${category} allocation on ${event.title}.`,
      });
    });
  };

  const handleTicketCheckout = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          eventId: event.id,
          callbackUrl: `${window.location.origin}/checkout/complete`,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sign in required", {
            description: "Log in first so your ticket and attendee data can be stored on your account.",
          });
          window.location.assign("/login?next=/account");
          return;
        }
        throw new Error(payload.message ?? "Could not start ticket checkout.");
      }

      window.location.assign(payload.data.authorization_url as string);
    } catch (error) {
      toast.error("Ticket checkout failed", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="glass-panel rounded-4xl p-8 md:p-10">
      <p className="eyebrow mb-4">Ticket Intake</p>
      <h2 className="display-title text-4xl leading-none sm:text-5xl">
        Collect DOB before checkout so category assignment stays deterministic.
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
        This form previews the youth versus senior logic used before payment begins.
        In production, the same rules run on the backend before ticket allocation,
        and attendees must be signed in so ticket data is stored against their account.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Input label="Full name" placeholder="Attendee name" {...form.register("fullName")} />
        <Input label="Email" type="email" placeholder="you@example.com" {...form.register("email")} />
        <Input label="Date of birth" type="date" {...form.register("dob")} />
        <Input label="City" placeholder="Cape Town" {...form.register("city")} />

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button type="submit">Check category</Button>
          <Button type="button" variant="secondary" onClick={handleTicketCheckout} disabled={isSubmitting}>
            {isSubmitting ? "Starting checkout..." : "Continue to payment"}
          </Button>
          {audience ? (
            <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-accent-strong dark:bg-sand/30">
              Eligible for {audience} quota
            </span>
          ) : null}
        </div>

        {Object.values(form.formState.errors).length ? (
          <div className="rounded-3xl border border-rose-400/25 bg-rose-50/70 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
            {Object.values(form.formState.errors)[0]?.message}
          </div>
        ) : null}
      </form>
    </section>
  );
}