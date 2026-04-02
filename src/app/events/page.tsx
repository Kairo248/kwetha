import { EventsExperience } from "@/components/sections/events-experience";
import { getEvents } from "@/lib/repositories/platform";

export default async function EventsPage() {
  const { items: events } = await getEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3 sm:mb-4">Events</p>
        <h1 className="display-title text-[2rem] leading-[1.1] tracking-tight sm:text-5xl sm:leading-none md:text-6xl">
          Ticketing designed for fair allocation and fast validation.
        </h1>
        <p className="mt-4 text-[0.9375rem] leading-7 text-muted sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
          Every event can maintain separate youth and senior quotas while still flowing through a shared checkout and validation engine.
        </p>
      </div>

      <EventsExperience events={events} />
    </div>
  );
}