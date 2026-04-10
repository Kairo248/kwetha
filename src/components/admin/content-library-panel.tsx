"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormStatus } from "@/components/admin/form-status";
import type { ContentItem } from "@/types/domain";

type ContentLibraryPanelProps = {
  items: ContentItem[];
  allowDelete: boolean;
};

type StatusState = {
  tone: "success" | "error";
  title: string;
  message: string;
} | null;

export function ContentLibraryPanel({ items, allowDelete }: ContentLibraryPanelProps) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
        No content items yet. Create a new upload from the form above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
      {items.map((item) => (
        <ContentLibraryRow key={item.id} item={item} allowDelete={allowDelete} />
      ))}
    </div>
  );
}

function ContentLibraryRow({ item, allowDelete }: { item: ContentItem; allowDelete: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingFeatured, setIsUpdatingFeatured] = useState(false);

  const deleteItem = async () => {
    const confirmed = window.confirm(`Delete “${item.title}”? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setStatus(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not delete content.");
      }

      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Delete failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async () => {
    setStatus(null);
    setIsUpdatingFeatured(true);

    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !Boolean(item.featured),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not update feature status.");
      }

      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Update failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsUpdatingFeatured(false);
    }
  };

  return (
    <article className="min-w-0 rounded-2xl border border-card-border p-3 sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sand/60 sm:h-24 sm:w-24 sm:rounded-3xl dark:bg-sand/15">
            {item.kind === "video" && item.assetUrl ? (
              <video src={item.assetUrl} className="h-full w-full object-cover" muted playsInline />
            ) : item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="surface-grid h-full w-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-lg md:text-xl">{item.title}</h3>
              <span className="rounded-full bg-sand px-2 py-0.5 text-[0.65rem] font-semibold text-accent-strong sm:px-3 sm:py-1 sm:text-xs">
                {item.kind}
              </span>
              {item.featured ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-white sm:px-3 sm:py-1 sm:text-xs">
                  Front Page
                </span>
              ) : null}
              {item.category ? (
                <span className="rounded-full border border-card-border px-2 py-0.5 text-[0.65rem] font-semibold text-muted sm:px-3 sm:py-1 sm:text-xs">
                  {item.category}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-7">{item.excerpt}</p>
          </div>
        </div>

        {allowDelete ? (
          <div className="flex shrink-0 flex-wrap gap-2 sm:pt-1">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs sm:w-auto sm:text-sm"
              onClick={toggleFeatured}
              disabled={isUpdatingFeatured || isDeleting}
            >
              {isUpdatingFeatured ? "Saving..." : item.featured ? "Remove from front page" : "Feature on front page"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full border-rose-300 text-xs text-rose-700 hover:border-rose-500 hover:text-rose-800 sm:w-auto sm:text-sm dark:text-rose-200"
              onClick={deleteItem}
              disabled={isDeleting || isUpdatingFeatured}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        ) : null}
      </div>

      {status ? <FormStatus className="mt-4" tone={status.tone} title={status.title} message={status.message} /> : null}
    </article>
  );
}
