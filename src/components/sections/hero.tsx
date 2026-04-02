"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Ticket, ShoppingBag, TvMinimalPlay } from "lucide-react";
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
    <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 pb-8 sm:gap-8 sm:pt-8 sm:pb-10 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass-panel rounded-[1.75rem] p-6 sm:rounded-[2.5rem] sm:p-8 md:p-12"
      >
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
              className="rounded-[1.5rem] border border-card-border bg-white/40 p-4 sm:rounded-[1.75rem] sm:p-5 dark:bg-white/5"
            >
              <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{metric.value}</div>
              <div className="mt-1.5 text-xs leading-snug text-muted sm:mt-2 sm:text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative overflow-hidden rounded-[1.75rem] border border-card-border bg-[#1d1714] p-5 text-white shadow-[0_28px_80px_rgba(16,12,9,0.35)] sm:rounded-[2.5rem] sm:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,176,109,0.32),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(99,196,187,0.22),transparent_28%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
              <span>Video-first Hero</span>
              <TvMinimalPlay className="h-4 w-4" />
            </div>
            <div className="mt-8 rounded-[1.75rem] bg-white/6 p-5">
              <div className="surface-grid relative flex h-56 items-end overflow-hidden rounded-3xl bg-white/6 p-4">
                {hero.mediaKind === "video" && hero.mediaUrl ? (
                  <video src={hero.mediaUrl} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
                ) : hero.mediaUrl ? (
                  <Image src={hero.mediaUrl} alt={hero.mediaTitle} fill className="object-cover" unoptimized />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {hero.mediaEyebrow}
                  </div>
                  <div className="display-title mt-3 text-4xl">{hero.mediaTitle}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/store"
              className="rounded-[1.75rem] border border-white/12 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <ShoppingBag className="h-5 w-5 text-[#efb06d]" />
              <div className="mt-4 text-lg font-semibold">Commerce</div>
              <div className="mt-2 text-sm leading-7 text-white/70">
                Books, merch, and future product drops.
              </div>
            </Link>
            <Link
              href="/events"
              className="rounded-[1.75rem] border border-white/12 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <Ticket className="h-5 w-5 text-[#efb06d]" />
              <div className="mt-4 text-lg font-semibold">Ticketing</div>
              <div className="mt-2 text-sm leading-7 text-white/70">
                DOB-aware category assignment and QR validation.
              </div>
            </Link>
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Built for Vercel + Supabase</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}