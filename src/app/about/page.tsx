import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">About</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Ikwetha is built to help creators grow with premium storytelling, commerce, and events.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          The platform combines content publishing, product sales, and ticketing into one connected
          experience. It is designed for brand consistency on the front end and reliable operational
          control behind the scenes.
        </p>
      </div>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <article className="glass-panel rounded-4xl p-6">
          <h2 className="text-xl font-semibold">Brand-first experience</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Visual storytelling, campaign surfaces, and curated content are structured to keep audience
            attention and strengthen identity over time.
          </p>
        </article>

        <article className="glass-panel rounded-4xl p-6">
          <h2 className="text-xl font-semibold">Commerce and ticketing</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Product checkouts and event bookings run on a shared backend so fulfillment, payment
            verification, and reporting stay aligned.
          </p>
        </article>

        <article className="glass-panel rounded-4xl p-6">
          <h2 className="text-xl font-semibold">Operator-ready admin</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Teams can manage events, content, and storefront updates from one dashboard while maintaining
            role-aware access controls.
          </p>
        </article>
      </section>

      <section className="mt-10 glass-panel rounded-4xl p-8 md:p-10">
        <h2 className="text-3xl font-semibold">What this means for your audience</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
          Visitors get a clean, trusted flow from discovery to action. They can explore stories, shop
          products, and secure event access in one place without disconnected systems or inconsistent
          branding.
        </p>
        <div className="mt-6">
          <Link href="/events" className="text-sm font-semibold text-accent-strong transition hover:text-ink">
            Explore upcoming events
          </Link>
        </div>
      </section>
    </div>
  );
}
