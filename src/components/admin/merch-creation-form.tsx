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
import { adminMerchSchema, type AdminMerchInput } from "@/lib/schemas";

type SubmissionState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

export function MerchCreationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const form = useForm<AdminMerchInput>({
    resolver: zodResolver(adminMerchSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 350,
      inventory: 25,
      isActive: true,
      imagePath: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmissionState(null);

    try {
      let imagePath = values.imagePath;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "merch");
        imagePath = uploadedAsset.path;
      }

      const response = await fetch("/api/admin/merch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          imagePath,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; item?: { title?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not create merch item.");
      }

      toast.success("Merch item created", {
        description: `${payload?.item?.title ?? values.title} is now available in the admin catalog.`,
      });
      setSubmissionState({
        tone: "success",
        title: "Merch item created",
        message: `${payload?.item?.title ?? values.title} is now part of the admin catalog.`,
      });
      form.reset({
        ...form.getValues(),
        title: "",
        description: "",
        imagePath: "",
      });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      toast.error("Merch creation failed", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
      setSubmissionState({
        tone: "error",
        title: "Merch creation failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="rounded-[2rem] border border-card-border bg-white/70 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:bg-white/5">
      <div className="max-w-2xl">
        <p className="eyebrow mb-4">Create Merch</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Add a new merch item without leaving the admin workspace.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Merch items are stored as active catalog entries and will appear on the store once they are saved as active.
        </p>
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <Input label="Product title" placeholder="Limited Edition Story Tee" {...form.register("title")} />
        </div>
        <Input label="Price (R)" type="number" min={0} step="0.01" {...form.register("price", { valueAsNumber: true })} />
        <Input label="Inventory" type="number" min={0} {...form.register("inventory", { valueAsNumber: true })} />
        <div className="md:col-span-2">
          <Textarea label="Description" placeholder="Materials, fit, drop notes, or campaign context." {...form.register("description")} />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Product image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-card-border bg-canvas/40 px-4 py-3 text-sm text-ink">
          <input type="checkbox" className="h-4 w-4 accent-accent" {...form.register("isActive")} />
          Make this item available in the public store immediately
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
            {isSubmitting ? "Creating merch..." : "Create merch item"}
          </Button>
          <p className="text-sm text-muted">Inventory is stored immediately, and product imagery is optional but recommended for the public store.</p>
        </div>
      </form>
    </section>
  );
}