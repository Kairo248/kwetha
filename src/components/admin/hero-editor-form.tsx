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
import { adminHomeHeroSchema, type AdminHomeHeroInput } from "@/lib/schemas";
import type { HomeHero } from "@/types/domain";

type SubmissionState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

type HeroEditorFormProps = {
  hero: HomeHero;
};

export function HeroEditorForm({ hero }: HeroEditorFormProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const form = useForm<AdminHomeHeroInput>({
    resolver: zodResolver(adminHomeHeroSchema),
    defaultValues: {
      eyebrow: hero.eyebrow,
      title: hero.title,
      description: hero.description,
      primaryCtaLabel: hero.primaryCtaLabel,
      primaryCtaHref: hero.primaryCtaHref,
      secondaryCtaLabel: hero.secondaryCtaLabel,
      secondaryCtaHref: hero.secondaryCtaHref,
      mediaPath: hero.mediaPath ?? "",
      mediaKind: hero.mediaKind,
      mediaEyebrow: hero.mediaEyebrow,
      mediaTitle: hero.mediaTitle,
      metricOneValue: hero.metricOneValue,
      metricOneLabel: hero.metricOneLabel,
      metricTwoValue: hero.metricTwoValue,
      metricTwoLabel: hero.metricTwoLabel,
      metricThreeValue: hero.metricThreeValue,
      metricThreeLabel: hero.metricThreeLabel,
    },
  });

  const mediaKind = form.watch("mediaKind");

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmissionState(null);

    try {
      let mediaPath = values.mediaPath;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "hero");
        mediaPath = uploadedAsset.path;
      }

      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          mediaPath,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { item?: { title?: string }; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not save the homepage hero.");
      }

      toast.success("Homepage hero updated", {
        description: `${payload?.item?.title ?? values.title} is now live on the homepage hero.`,
      });
      setSubmissionState({
        tone: "success",
        title: "Hero updated",
        message: "The homepage hero now reflects the latest title, links, metrics, and uploaded media.",
      });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again shortly.";
      toast.error("Hero update failed", { description: message });
      setSubmissionState({ tone: "error", title: "Hero update failed", message });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="glass-panel rounded-4xl p-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Homepage Hero</p>
        <h2 className="text-3xl font-semibold">Control the hero headline, buttons, metrics, and media from admin.</h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Upload a fresh hero image or video and update the main copy without touching code.
        </p>
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <Input label="Eyebrow" placeholder="Premium Brand Infrastructure" {...form.register("eyebrow")} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Headline" placeholder="A modern digital home for Lilitha's story..." {...form.register("title")} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Description" placeholder="Designed to look premium in public..." {...form.register("description")} />
        </div>

        <Input label="Primary CTA label" placeholder="Explore events" {...form.register("primaryCtaLabel")} />
        <Input label="Primary CTA link" placeholder="/events" {...form.register("primaryCtaHref")} />
        <Input label="Secondary CTA label" placeholder="Shop the store" {...form.register("secondaryCtaLabel")} />
        <Input label="Secondary CTA link" placeholder="/store" {...form.register("secondaryCtaHref")} />

        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Hero media type</span>
          <select className="h-12 rounded-2xl border border-card-border bg-canvas px-4 outline-none transition focus:border-accent" {...form.register("mediaKind")}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <Input label="Media label" placeholder="Campaign preview" {...form.register("mediaEyebrow")} />
        <div className="md:col-span-2">
          <Input label="Media title" placeholder="Story in motion" {...form.register("mediaTitle")} />
        </div>
        <div className="md:col-span-2">
          <Input
            label={mediaKind === "video" ? "Hero video" : "Hero image"}
            type="file"
            accept={mediaKind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml"}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <Input label="Metric one value" placeholder="24+" {...form.register("metricOneValue")} />
        <Input label="Metric one label" placeholder="Content collections" {...form.register("metricOneLabel")} />
        <Input label="Metric two value" placeholder="5k+" {...form.register("metricTwoValue")} />
        <Input label="Metric two label" placeholder="Scalable users" {...form.register("metricTwoLabel")} />
        <Input label="Metric three value" placeholder="500" {...form.register("metricThreeValue")} />
        <Input label="Metric three label" placeholder="Quota-aware tickets" {...form.register("metricThreeLabel")} />

        {submissionState ? (
          <FormStatus className="md:col-span-2" tone={submissionState.tone} title={submissionState.title} message={submissionState.message} />
        ) : null}

        {Object.values(form.formState.errors).length ? (
          <div className="md:col-span-2 rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-100">
            {Object.values(form.formState.errors)[0]?.message}
          </div>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving hero..." : "Save hero"}
          </Button>
          <p className="text-sm text-muted">The uploaded media replaces the existing hero asset only when a new file is selected.</p>
        </div>
      </form>
    </section>
  );
}