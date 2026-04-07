"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Ticket, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeHero } from "@/types/domain";

type HeroSectionProps = {
  hero: HomeHero;
};

export function HeroSection({ hero }: HeroSectionProps) {
  const metrics = [
    { label: hero.metricOneLabel, value: hero.metricOneValue },
    { label: hero.metricTwoLabel, value: hero.metricTwoValue },
    { label: hero.metricThreeLabel, value: hero.metricThreeValue },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-6 pb-10 sm:gap-10 sm:pt-8 sm:pb-12 md:grid-cols-2 md:gap-10 md:px-8 md:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="order-2 flex flex-col justify-center md:order-1"
      >
        <div className="glass-panel rounded-[1.75rem] p-6 sm:rounded-[2.5rem] sm:p-8 md:p-12">
          <p className="eyebrow mb-3 sm:mb-4">{hero.eyebrow}</p>
          <h1 className="display-title max-w-4xl text-[2.4rem] leading-[1.05] tracking-tight sm:text-5xl sm:leading-none md:text-6xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[0.9375rem] leading-7 text-muted sm:text-base sm:leading-8 md:text-lg">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asLink href={hero.primaryCtaHref}>
              {hero.primaryCtaLabel}
            </Button>
            <Button asLink href={hero.secondaryCtaHref} variant="secondary">
              {hero.secondaryCtaLabel}
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                className="rounded-3xl border border-card-border bg-white/40 p-4 sm:rounded-[1.75rem] sm:p-5 dark:bg-white/5"
              >
                <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{metric.value}</div>
                <div className="mt-1.5 text-xs leading-snug text-muted sm:mt-2 sm:text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="order-1 flex min-h-0 flex-col gap-5 md:order-2 lg:gap-6"
      >
        <div
          className={
            "relative isolate w-full overflow-hidden rounded-4xl border border-white/8 bg-[#0c0a09] shadow-[0_32px_120px_-24px_rgba(0,0,0,0.55)] ring-1 ring-white/6 sm:rounded-[2.25rem] lg:rounded-[2.5rem]"
          }
        >
          <div className="relative h-[min(68vh,620px)] w-full sm:h-[min(52vh,440px)] md:h-[min(56vh,500px)] lg:h-[min(80vh,760px)]">
            {hero.mediaKind === "video" && hero.mediaUrl ? (
              <video
                src={hero.mediaUrl}
                className="absolute inset-0 h-full w-full scale-[1.01] object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : hero.mediaUrl ? (
              <Image
                src={hero.mediaUrl}
                alt={hero.mediaTitle}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-stone-800 via-stone-900 to-black" />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 lg:p-12">
              <div className="max-w-xl">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-white/55 sm:text-xs">
                  {hero.mediaEyebrow}
                </p>
                <h2 className="display-title mt-3 text-3xl leading-[1.05] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.02]">
                  {hero.mediaTitle}
                </h2>
              </div>
            </div>

            {hero.mediaKind === "video" && hero.mediaUrl ? (
              <div className="pointer-events-none absolute right-5 top-5 sm:right-6 sm:top-6">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-md sm:text-xs">
                  Video
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/store"
            className="group rounded-2xl border border-card-border/80 bg-card/50 p-4 transition hover:border-accent/30 hover:bg-card sm:rounded-3xl sm:p-5"
          >
            <ShoppingBag className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
            <div className="mt-3 text-sm font-semibold sm:mt-4 sm:text-base">Commerce</div>
            <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">
              Books, merch, and future product drops.
            </div>
          </Link>
          <Link
            href="/events"
            className="group rounded-2xl border border-card-border/80 bg-card/50 p-4 transition hover:border-accent/30 hover:bg-card sm:rounded-3xl sm:p-5"
          >
            <Ticket className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
            <div className="mt-3 text-sm font-semibold sm:mt-4 sm:text-base">Ticketing</div>
            <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">
              DOB-aware categories and QR validation.
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-card-border/60 pt-4 text-xs text-muted sm:text-sm">
          <span>Built for Vercel + Supabase</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        </div>
      </motion.div>
    </section>
  );
}
