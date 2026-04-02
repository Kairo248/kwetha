"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import { uploadAdminAsset } from "@/lib/admin-upload";
import type { PlatformEvent } from "@/types/domain";

type EventOperationsPanelProps = {
  events: PlatformEvent[];
};

type StatusState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

export function EventOperationsPanel({ events }: EventOperationsPanelProps) {
  if (!events.length) {
    return (
      <div className="glass-panel rounded-4xl border border-dashed border-card-border p-8 text-sm text-muted">
        No events exist yet. Use the create form to publish your first event, add a banner image, then return here to refine quotas, pricing, or scheduling.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      {events.map((event) => (
        <EditableEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EditableEventCard({ event }: { event: PlatformEvent }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [summary, setSummary] = useState(event.summary);
  const [venue, setVenue] = useState(event.venue);
  const [startsAt, setStartsAt] = useState(toDateTimeLocalValue(event.dateLabel));
  const [capacity, setCapacity] = useState(event.capacity);
  const [youthQuota, setYouthQuota] = useState(event.youthQuota);
  const [seniorQuota, setSeniorQuota] = useState(event.seniorQuota);
  const [ticketPrice, setTicketPrice] = useState(event.price);
  const [published, setPublished] = useState(event.published ?? true);
  const [bannerImagePath, setBannerImagePath] = useState(event.imagePath ?? "");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(event.imageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const saveEvent = async () => {
    setStatus(null);
    setIsSaving(true);

    try {
      let uploadedPath = bannerImagePath;
      let uploadedUrl = bannerPreviewUrl;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "events");
        uploadedPath = uploadedAsset.path;
        uploadedUrl = uploadedAsset.publicUrl ?? uploadedUrl;
      }

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          summary,
          venue,
          startsAt,
          capacity,
          youthQuota,
          seniorQuota,
          ticketPrice,
          published,
          bannerImagePath: uploadedPath || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not update event.");
      }

      setBannerImagePath(uploadedPath);
      setBannerPreviewUrl(uploadedUrl || "");
      setSelectedFile(null);
      setStatus({
        tone: "success",
        title: "Event updated",
        message: `${title} now reflects the latest admin changes.`,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Update failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async () => {
    const confirmed = window.confirm(`Delete ${event.title}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setStatus(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not delete event.");
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
    <article className="glass-panel overflow-hidden rounded-3xl p-5 sm:rounded-4xl sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 gap-5">
          {bannerPreviewUrl ? (
            <Image src={bannerPreviewUrl} alt={title} width={112} height={112} className="h-28 w-28 rounded-3xl object-cover" unoptimized />
          ) : (
            <div className="surface-grid h-28 w-28 rounded-3xl bg-sand/60 dark:bg-sand/15" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold">{event.title}</h3>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                R {event.price.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{event.dateLabel} · {event.venue}</p>
            <p className="mt-4 text-sm leading-7 text-muted">{event.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-card-border px-3 py-2">Capacity {event.capacity}</span>
              <span className="rounded-full border border-card-border px-3 py-2">Youth {event.youthQuota}</span>
              <span className="rounded-full border border-card-border px-3 py-2">Senior {event.seniorQuota}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? "Close editor" : "Edit event"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="border-rose-300 text-rose-700 hover:border-rose-500 hover:text-rose-800 dark:text-rose-200"
            onClick={deleteEvent}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {status ? <FormStatus className="mt-6" tone={status.tone} title={status.title} message={status.message} /> : null}

      {isEditing ? (
        <div className="mt-8 grid gap-4 border-t border-card-border/60 pt-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Event title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <Input label="Venue" value={venue} onChange={(event) => setVenue(event.target.value)} />
          <Input label="Start date and time" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          <div className="md:col-span-2">
            <Textarea label="Summary" value={summary} onChange={(event) => setSummary(event.target.value)} />
          </div>
          <Input label="Capacity" type="number" min={1} value={String(capacity)} onChange={(event) => setCapacity(Number(event.target.value))} />
          <Input label="Ticket price (R)" type="number" min={0} step="0.01" value={String(ticketPrice)} onChange={(event) => setTicketPrice(Number(event.target.value))} />
          <Input label="Youth quota" type="number" min={0} value={String(youthQuota)} onChange={(event) => setYouthQuota(Number(event.target.value))} />
          <Input label="Senior quota" type="number" min={0} value={String(seniorQuota)} onChange={(event) => setSeniorQuota(Number(event.target.value))} />
          <div className="md:col-span-2">
            <Input
              label="Banner image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                if (file) {
                  setBannerPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-card-border bg-canvas/40 px-4 py-3 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 accent-accent" checked={published} onChange={(event) => setPublished(event.target.checked)} />
            Keep this event published on the public site
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={saveEvent} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
            <p className="text-sm text-muted">Upload a new banner only if you want to replace the current event image.</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function toDateTimeLocalValue(dateLabel: string) {
  const date = new Date(dateLabel);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}T18:00`;
}