import { EventIntakeForm } from "@/components/forms/event-intake-form";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/repositories/platform";
import Image from "next/image";

export default async function EventsPage() {
  const { items: events } = await getEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Events</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Ticketing designed for fair allocation and fast validation.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          Every event can maintain separate youth and senior quotas while still flowing through a shared checkout and validation engine.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="glass-panel rounded-4xl p-8">
            {event.imageUrl ? (
              <Image src={event.imageUrl} alt={event.title} width={720} height={360} className="mb-6 h-52 w-full rounded-3xl object-cover" unoptimized />
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
            <Button className="mt-6">Start ticket checkout</Button>
          </article>
        ))}
      </div>

      <div className="mt-10">
        {events[0] ? <EventIntakeForm event={events[0]} /> : null}
      </div>
    </div>
  );
}