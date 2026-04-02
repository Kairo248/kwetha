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
      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:gap-5 lg:gap-6">
        {events.map((event) => {
          const isSelected = event.id === selectedEvent?.id;

          return (
            <article
              key={event.id}
              className={cn(
                "glass-panel flex min-w-0 h-full flex-col rounded-2xl p-3 transition sm:rounded-3xl sm:p-5 md:rounded-4xl md:p-6 lg:p-8",
                isSelected ? "ring-2 ring-accent" : "ring-1 ring-transparent",
              )}
            >
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={720}
                  height={360}
                  className="mb-3 h-28 w-full rounded-xl object-cover sm:mb-4 sm:h-40 sm:rounded-2xl md:mb-5 md:h-44 md:rounded-3xl lg:mb-6 lg:h-52"
                  unoptimized
                />
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight sm:text-xl md:text-2xl lg:text-3xl">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-[0.65rem] leading-relaxed text-muted sm:mt-2 sm:text-sm">
                    {event.dateLabel} · {event.venue}
                  </p>
                </div>
                <span className="inline-flex w-fit shrink-0 rounded-full bg-accent px-2 py-1 text-[0.65rem] font-semibold text-white sm:px-3 sm:py-1.5 sm:text-xs">
                  R {event.price.toFixed(2)}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-[0.65rem] leading-5 text-muted sm:mt-4 sm:line-clamp-4 sm:text-sm sm:leading-7 md:line-clamp-none">
                {event.summary}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:mt-6 sm:gap-3">
                <div className="rounded-2xl border border-card-border p-2.5 sm:rounded-3xl sm:p-4">
                  <div className="text-lg font-semibold tabular-nums sm:text-2xl">{event.capacity}</div>
                  <div className="mt-1 text-[0.65rem] uppercase leading-tight tracking-[0.18em] text-muted sm:text-xs sm:tracking-[0.22em]">
                    Capacity
                  </div>
                </div>
                <div className="rounded-2xl border border-card-border p-2.5 sm:rounded-3xl sm:p-4">
                  <div className="text-lg font-semibold tabular-nums sm:text-2xl">{event.youthQuota}</div>
                  <div className="mt-1 text-[0.65rem] uppercase leading-tight tracking-[0.18em] text-muted sm:text-xs sm:tracking-[0.22em]">
                    Youth
                  </div>
                </div>
                <div className="rounded-2xl border border-card-border p-2.5 sm:rounded-3xl sm:p-4">
                  <div className="text-lg font-semibold tabular-nums sm:text-2xl">{event.seniorQuota}</div>
                  <div className="mt-1 text-[0.65rem] uppercase leading-tight tracking-[0.18em] text-muted sm:text-xs sm:tracking-[0.22em]">
                    Senior
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="text-xs text-muted sm:text-sm">
                  {isSelected ? "Selected for checkout" : "Click to buy this ticket"}
                </div>
                <Button
                  type="button"
                  className="w-full shrink-0 sm:w-auto"
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

      <div id="event-ticket-checkout" className="mt-8 sm:mt-10">
        {selectedEvent ? <EventIntakeForm event={selectedEvent} /> : null}
      </div>
    </>
  );
}