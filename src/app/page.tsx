import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, RadioTower, ShieldCheck } from "lucide-react";
import { EventIntakeForm } from "@/components/forms/event-intake-form";
import { BrandMarquee } from "@/components/sections/brand-marquee";
import { HeroSection } from "@/components/sections/hero";
import { Button } from "@/components/ui/button";
import { getBrands, getContentCollection, getEvents, getHomeHero, getProducts } from "@/lib/repositories/platform";

export default async function Home() {
  const [{ items: events }, { items: products }, { items: content }, { items: brands }, { item: hero }] = await Promise.all([
    getEvents(),
    getProducts(),
    getContentCollection(),
    getBrands(),
    getHomeHero(),
  ]);

  const featuredEvent = events[0];
  const featuredProduct = products[0];

  return (
    <div className="pb-20">
      <HeroSection hero={hero} />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
        {[
          {
            title: "Revenue engine",
            copy: "Books, tickets, and future merch all share one commerce layer.",
            icon: CheckCircle2,
          },
          {
            title: "Ticket integrity",
            copy: "Youth and senior quotas are enforced with transactional allocation rules.",
            icon: ShieldCheck,
          },
          {
            title: "Live campaign ready",
            copy: "Built for launch spikes, drop moments, and mobile-first conversion.",
            icon: RadioTower,
          },
          {
            title: "Admin control",
            copy: "Internal teams manage events, content, sales, and check-in from one dashboard.",
            icon: ArrowRight,
          },
        ].map((item) => (
          <article key={item.title} className="glass-panel rounded-4xl p-6">
            <item.icon className="mb-4 h-5 w-5 text-accent-strong" />
            <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
            <p className="text-sm leading-7 text-muted">{item.copy}</p>
          </article>
        ))}
      </section>

      <BrandMarquee brands={brands} />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div className="glass-panel rounded-4xl p-8 md:p-10">
          <p className="eyebrow mb-4">Platform Blueprint</p>
          <h2 className="display-title max-w-2xl text-4xl leading-none sm:text-5xl">
            Brand storytelling, commerce, and ticketing in one growth stack.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Ikwetha is structured as a premium digital operating system for Lilitha
            Ntsundwani today and additional creators tomorrow. The public layer
            builds demand, the commerce layer captures revenue, and the admin layer
            controls content, inventory, and event validation.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Next.js App Router with server-first rendering",
              "Supabase Auth, Postgres, Storage, and Edge Functions",
              "Paystack-first payment flow with backend verification",
              "Role-aware admin dashboard and mobile scanning experience",
            ].map((line) => (
              <div key={line} className="rounded-3xl border border-card-border bg-white/45 p-4 text-sm text-muted dark:bg-white/5">
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <article className="glass-panel rounded-4xl p-8">
            <p className="eyebrow mb-4">Featured Event</p>
            {featuredEvent.imageUrl ? (
              <Image src={featuredEvent.imageUrl} alt={featuredEvent.title} width={720} height={360} className="mb-6 h-52 w-full rounded-3xl object-cover" unoptimized />
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">{featuredEvent.title}</h3>
                <p className="mt-2 text-sm text-muted">{featuredEvent.dateLabel}</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                {featuredEvent.venue}
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-muted">{featuredEvent.summary}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-3xl bg-sand/60 p-4 dark:bg-sand/30">
                <div className="text-xl font-semibold">{featuredEvent.capacity}</div>
                <div className="text-muted">Capacity</div>
              </div>
              <div className="rounded-3xl bg-sand/60 p-4 dark:bg-sand/30">
                <div className="text-xl font-semibold">{featuredEvent.youthQuota}</div>
                <div className="text-muted">Youth</div>
              </div>
              <div className="rounded-3xl bg-sand/60 p-4 dark:bg-sand/30">
                <div className="text-xl font-semibold">{featuredEvent.seniorQuota}</div>
                <div className="text-muted">Senior</div>
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-4xl p-8">
            <p className="eyebrow mb-4">Store Spotlight</p>
            {featuredProduct.imageUrl ? (
              <Image src={featuredProduct.imageUrl} alt={featuredProduct.title} width={720} height={360} className="mb-6 h-52 w-full rounded-3xl object-cover" unoptimized />
            ) : null}
            <h3 className="text-2xl font-semibold">{featuredProduct.title}</h3>
            <p className="mt-4 text-sm leading-7 text-muted">{featuredProduct.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-2xl font-semibold">R {featuredProduct.price.toFixed(2)}</span>
              <Button asLink href="/store">
                Open Store
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Media and Content</p>
            <h2 className="display-title text-4xl leading-none sm:text-5xl">
              Dynamic publishing for articles, galleries, and campaigns.
            </h2>
          </div>
          <Link className="text-sm font-semibold text-accent-strong" href="/content">
            View all content
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {content.slice(0, 3).map((item) => (
            <article key={item.id} className="glass-panel rounded-4xl overflow-hidden">
              <div className="relative h-48 overflow-hidden bg-sand/60 dark:bg-sand/15">
                {item.kind === "video" && item.assetUrl ? (
                  <video src={item.assetUrl} className="h-full w-full object-cover" muted playsInline loop />
                ) : item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="surface-grid h-full w-full px-6 py-6" />
                )}
                <div className="absolute left-6 top-6">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent-strong dark:bg-black/40">
                    {item.kind}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                {item.category ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">{item.category}</p> : null}
                <p className="mt-3 text-sm leading-7 text-muted">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-8">
        {featuredEvent ? <EventIntakeForm event={featuredEvent} /> : null}
        <div className="glass-panel rounded-4xl p-8 md:p-10">
          <p className="eyebrow mb-4">Why the Ticket Logic Matters</p>
          <h2 className="display-title text-4xl leading-none sm:text-5xl">
            Allocation rules protect fairness when demand spikes.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              Every ticket request captures date of birth, determines audience
              category, and checks the correct quota before payment is accepted.
            </p>
            <p>
              Verification happens on trusted backend infrastructure. Frontend code
              never decides whether a payment is valid or whether a scan should be
              accepted.
            </p>
            <p>
              The database migration includes locking and RPC patterns so the platform
              can support high-concurrency ticket drops without overselling.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asLink href="/events">
              Browse Events
            </Button>
            <Button asLink href="/admin" variant="secondary">
              View Admin Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
