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
import { adminBrandSchema, type AdminBrandInput } from "@/lib/schemas";

type SubmissionState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

export function BrandCreationForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const form = useForm<AdminBrandInput>({
    resolver: zodResolver(adminBrandSchema),
    defaultValues: {
      name: "",
      description: "",
      websiteUrl: "",
      logoPath: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmissionState(null);

    try {
      let logoPath = values.logoPath;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "brands");
        logoPath = uploadedAsset.path;
      }

      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          logoPath,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { item?: { name?: string }; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not create brand.");
      }

      toast.success("Brand created", {
        description: `${payload?.item?.name ?? values.name} is now available for the homepage slider.`,
      });
      setSubmissionState({
        tone: "success",
        title: "Brand created",
        message: `${payload?.item?.name ?? values.name} was added to the brand showcase.`,
      });
      form.reset({
        name: "",
        description: "",
        websiteUrl: "",
        logoPath: "",
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again shortly.";
      toast.error("Brand creation failed", { description: message });
      setSubmissionState({ tone: "error", title: "Brand creation failed", message });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="glass-panel rounded-4xl p-8">
      <div className="max-w-2xl">
        <p className="eyebrow mb-4">Create Brand</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Upload brand logos and descriptions for the public slider.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          This is for client, collaborator, and campaign partner logos that should rotate on the public site.
        </p>
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <Input label="Brand name" placeholder="Northline Studio" {...form.register("name")} />
        </div>

        <Input label="Website URL" placeholder="https://brand.com" {...form.register("websiteUrl")} />
        <Input label="Slider order" type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} />

        <div className="md:col-span-2">
          <Textarea label="Description" placeholder="Creative strategy, campaign production, editorial partnership." {...form.register("description")} />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Brand logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-card-border bg-canvas/40 px-4 py-3 text-sm text-ink">
          <input type="checkbox" className="h-4 w-4 accent-accent" {...form.register("isActive")} />
          Show this brand on the public website slider
        </label>

        {submissionState ? (
          <FormStatus className="md:col-span-2" tone={submissionState.tone} title={submissionState.title} message={submissionState.message} />
        ) : null}

        {Object.values(form.formState.errors).length ? (
          <div className="md:col-span-2 rounded-3xl border border-rose-400/25 bg-rose-50/70 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
            {Object.values(form.formState.errors)[0]?.message}
          </div>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating brand..." : "Create brand"}
          </Button>
          <p className="text-sm text-muted">SVG logos are supported and work best for sharp marquee display.</p>
        </div>
      </form>
    </section>
  );
}