"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormStatus } from "@/components/admin/form-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadAdminAsset } from "@/lib/admin-upload";
import { adminEventSchema, type AdminEventInput } from "@/lib/schemas";

type SubmissionState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

export function EventCreationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const form = useForm<AdminEventInput>({
    resolver: zodResolver(adminEventSchema),
    defaultValues: {
      title: "",
      summary: "",
      venue: "",
      startsAt: "",
      capacity: 120,
      youthQuota: 60,
      seniorQuota: 40,
      ticketPrice: 250,
      published: true,
      bannerImagePath: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmissionState(null);

    try {
      let bannerImagePath = values.bannerImagePath;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "events");
        bannerImagePath = uploadedAsset.path;
      }

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          bannerImagePath,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; item?: { title?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not create event.");
      }

      toast.success("Event created", {
        description: `${payload?.item?.title ?? values.title} is now available in the admin event list.`,
      });
      setSubmissionState({
        tone: "success",
        title: "Event created",
        message: `${payload?.item?.title ?? values.title} was saved and is ready for editing below.`,
      });
      form.reset({
        ...form.getValues(),
        title: "",
        summary: "",
        venue: "",
        startsAt: "",
        bannerImagePath: "",
      });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      toast.error("Event creation failed", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
      setSubmissionState({
        tone: "error",
        title: "Event creation failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="rounded-[2rem] border border-white/10 bg-stone-950 p-8 text-stone-50 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">Create Event</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Launch a new event with quota and ticket settings in one step.
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          This writes a new event directly into Supabase so the public events page and ticket checkout can use it immediately.
        </p>
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <Input label="Event title" placeholder="Stories at Sunset" {...form.register("title")} />
        </div>
        <Input label="Venue" placeholder="Cape Town City Hall" {...form.register("venue")} />
        <Input label="Start date and time" type="datetime-local" {...form.register("startsAt")} />
        <div className="md:col-span-2">
          <Textarea label="Summary" placeholder="What the event is about, who it is for, and why it matters." {...form.register("summary")} />
        </div>
        <Input label="Capacity" type="number" min={1} {...form.register("capacity", { valueAsNumber: true })} />
        <Input label="Ticket price (R)" type="number" min={0} step="0.01" {...form.register("ticketPrice", { valueAsNumber: true })} />
        <Input label="Youth quota" type="number" min={0} {...form.register("youthQuota", { valueAsNumber: true })} />
        <Input label="Senior quota" type="number" min={0} {...form.register("seniorQuota", { valueAsNumber: true })} />
        <div className="md:col-span-2">
          <Input
            label="Banner image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
          <input type="checkbox" className="h-4 w-4 accent-teal-400" {...form.register("published")} />
          Publish to the public site immediately
        </label>

        {submissionState ? (
          <FormStatus className="md:col-span-2" tone={submissionState.tone} title={submissionState.title} message={submissionState.message} />
        ) : null}

        {Object.values(form.formState.errors).length ? (
          <div className="md:col-span-2 rounded-3xl border border-rose-400/25 bg-rose-950/30 p-4 text-sm text-rose-100">
            {Object.values(form.formState.errors)[0]?.message}
          </div>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="bg-teal-500 text-stone-950 hover:bg-teal-400">
            {isSubmitting ? "Creating event..." : "Create event"}
          </Button>
          <p className="text-sm text-stone-400">Ticket quotas are validated before the event is saved, and banner uploads are optional.</p>
        </div>
      </form>
    </section>
  );
}