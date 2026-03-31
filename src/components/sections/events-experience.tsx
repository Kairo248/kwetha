"use client";

import { useState } from "react";
import Image from "next/image";
import { EventIntakeForm } from "@/components/forms/event-intake-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PlatformEvent } from "@/types/domain";

type EventsExperienceProps = {
  events: PlatformEvent[];
};

export function EventsExperience({ events }: EventsExperienceProps) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? null);

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0] ?? null;

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    document.getElementById("event-ticket-checkout")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {events.map((event) => {
          const isSelected = event.id === selectedEvent?.id;

          return (
            <article
              key={event.id}
              className={cn(
                "glass-panel rounded-4xl p-8 transition",
                isSelected ? "ring-2 ring-accent" : "ring-1 ring-transparent",
              )}
            >
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={720}
                  height={360}
                  className="mb-6 h-52 w-full rounded-3xl object-cover"
                  unoptimized
                />
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold">{event.title}</h2>
                  <p className="mt-3 text-sm text-muted">{event.dateLabel} · {event.venue}</p>
                </div>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                  R {event.price.toFixed(2)}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">{event.summary}</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-3xl border border-card-border p-4">
                  <div className="text-2xl font-semibold">{event.capacity}</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted">Capacity</div>
                </div>
                <div className="rounded-3xl border border-card-border p-4">
                  <div className="text-2xl font-semibold">{event.youthQuota}</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted">Youth</div>
                </div>
                <div className="rounded-3xl border border-card-border p-4">
                  <div className="text-2xl font-semibold">{event.seniorQuota}</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted">Senior</div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="text-sm text-muted">
                  {isSelected ? "Selected for checkout" : "Click to buy this ticket"}
                </div>
                <Button
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => handleSelectEvent(event.id)}
                >
                  {isSelected ? "Selected" : "Select ticket"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div id="event-ticket-checkout" className="mt-10">
        {selectedEvent ? <EventIntakeForm event={selectedEvent} /> : null}
      </div>
    </>
  );
}