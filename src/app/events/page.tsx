import { EventsExperience } from "@/components/sections/events-experience";
import { getEvents } from "@/lib/repositories/platform";

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

      <EventsExperience events={events} />
    </div>
  );
}