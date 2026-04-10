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
import { adminContentSchema, type AdminContentInput } from "@/lib/schemas";

type SubmissionState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

export function ContentCreationForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const form = useForm<AdminContentInput>({
    resolver: zodResolver(adminContentSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      kind: "image",
      contentCategory: "personal",
      partnerName: "",
      assetPath: "",
      featured: true,
      publishNow: true,
    },
  });

  const contentKind = form.watch("kind");
  const contentCategory = form.watch("contentCategory");

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmissionState(null);

    try {
      let assetPath = values.assetPath;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "content");
        assetPath = uploadedAsset.path;
      }

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          assetPath,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { item?: { title?: string }; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not create content item.");
      }

      toast.success("Content created", {
        description: `${payload?.item?.title ?? values.title} is now available in the content library.`,
      });
      setSubmissionState({
        tone: "success",
        title: "Content created",
        message: `${payload?.item?.title ?? values.title} was saved and published according to the selected options.`,
      });
      form.reset({
        title: "",
        excerpt: "",
        kind: values.kind,
        contentCategory: values.contentCategory,
        partnerName: "",
        assetPath: "",
        featured: values.featured,
        publishNow: values.publishNow,
      });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again shortly.";
      toast.error("Content creation failed", { description: message });
      setSubmissionState({ tone: "error", title: "Content creation failed", message });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="rounded-4xl border border-white/10 bg-stone-950 p-8 text-stone-50 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">Create Content</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Upload campaign images, videos, or editorial content with category control.
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          Use this for brand campaigns, visual drops, behind-the-scenes media, or thought pieces. Files are optional for articles and expected for image or video content.
        </p>
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <Input label="Title" placeholder="Campaign reveal for a brand partner" {...form.register("title")} />
        </div>

        <label className="grid gap-2 text-sm font-medium text-stone-50">
          <span>Content type</span>
          <select
            className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 outline-none transition focus:border-teal-400"
            {...form.register("kind")}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="gallery">Gallery</option>
            <option value="article">Article</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-50">
          <span>Feed category</span>
          <select
            className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 outline-none transition focus:border-teal-400"
            {...form.register("contentCategory")}
          >
            <option value="personal">Personal</option>
            <option value="partnership">Partnership</option>
          </select>
        </label>

        {contentCategory === "partnership" ? (
          <Input label="Partner name" placeholder="Nike" {...form.register("partnerName")} />
        ) : (
          <div />
        )}

        <div className="md:col-span-2">
          <Textarea label="Description" placeholder="What the content is, who it was created for, and what it represents." {...form.register("excerpt")} />
        </div>

        <div className="md:col-span-2">
          <Input
            label={contentKind === "video" ? "Video file" : "Image file"}
            type="file"
            accept={contentKind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml"}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
          <input type="checkbox" className="h-4 w-4 accent-teal-400" {...form.register("featured")} />
          Mark as featured content
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
          <input type="checkbox" className="h-4 w-4 accent-teal-400" {...form.register("publishNow")} />
          Publish immediately to the public site
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
            {isSubmitting ? "Saving content..." : "Create content"}
          </Button>
          <p className="text-sm text-stone-400">Images and videos are uploaded to storage, while feed categories keep public content grouped as personal or partnership drops.</p>
        </div>
      </form>
    </section>
  );
}