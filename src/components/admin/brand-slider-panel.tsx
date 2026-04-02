"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormStatus } from "@/components/admin/form-status";
import type { BrandItem } from "@/types/domain";

type BrandSliderPanelProps = {
  items: BrandItem[];
  allowDelete: boolean;
};

type StatusState = {
  tone: "success" | "error";
  title: string;
  message: string;
} | null;

export function BrandSliderPanel({ items, allowDelete }: BrandSliderPanelProps) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
        No active brands yet. Add one to power the homepage slider.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
      {items.map((brand) => (
        <BrandSliderRow key={brand.id} brand={brand} allowDelete={allowDelete} />
      ))}
    </div>
  );
}

function BrandSliderRow({ brand, allowDelete }: { brand: BrandItem; allowDelete: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusState>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteBrand = async () => {
    const confirmed = window.confirm(`Delete “${brand.name}”? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setStatus(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/brands/${brand.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not delete brand.");
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

  return (
    <article className="min-w-0 rounded-2xl border border-card-border p-3 sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-950/90 p-2 sm:h-18 sm:w-22 sm:rounded-3xl sm:p-3">
            {brand.logoUrl ? (
              <Image src={brand.logoUrl} alt={brand.name} width={96} height={40} className="max-h-8 w-auto object-contain sm:max-h-10" unoptimized />
            ) : (
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white sm:text-xs sm:tracking-[0.28em]">
                {brand.name.slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-lg md:text-xl">{brand.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-7">{brand.description}</p>
          </div>
        </div>

        {allowDelete ? (
          <div className="flex shrink-0 sm:pt-1">
            <Button
              type="button"
              variant="secondary"
              className="w-full border-rose-300 text-xs text-rose-700 hover:border-rose-500 hover:text-rose-800 sm:w-auto sm:text-sm dark:text-rose-200"
              onClick={deleteBrand}
              disabled={isDeleting}
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
