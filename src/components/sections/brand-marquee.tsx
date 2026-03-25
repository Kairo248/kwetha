import Image from "next/image";
import Link from "next/link";
import type { BrandItem } from "@/types/domain";

type BrandMarqueeProps = {
  brands: BrandItem[];
};

export function BrandMarquee({ brands }: BrandMarqueeProps) {
  if (!brands.length) {
    return null;
  }

  const repeated = [...brands, ...brands];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3">Brand Collaborations</p>
          <h2 className="display-title text-4xl leading-none sm:text-5xl">
            Partnerships, campaigns, and client work in motion.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-muted">
          Lilitha is building around brands and campaign work. This strip surfaces collaborators, clients, and creative partners directly from the admin workspace.
        </p>
      </div>

      <div className="overflow-hidden rounded-4xl border border-card-border/70 bg-white/35 py-4 shadow-[0_24px_60px_rgba(32,24,19,0.08)] dark:bg-white/5">
        <div className="brand-marquee-track flex min-w-max gap-4 px-4">
          {repeated.map((brand, index) => {
            const card = (
              <article className="flex w-70 shrink-0 items-center gap-4 rounded-[1.75rem] border border-card-border bg-canvas/80 px-5 py-4 backdrop-blur-md">
                <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-950/90 px-3 py-2">
                  {brand.logoUrl ? (
                    <Image src={brand.logoUrl} alt={brand.name} width={96} height={48} className="max-h-10 w-auto object-contain" unoptimized />
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white">{brand.name.slice(0, 2)}</span>
                  )}
                </div>
                <div>
                  <div className="text-base font-semibold text-ink">{brand.name}</div>
                  <div className="mt-1 text-sm leading-6 text-muted">{brand.description}</div>
                </div>
              </article>
            );

            return brand.websiteUrl ? (
              <Link key={`${brand.id}-${index}`} href={brand.websiteUrl} target="_blank" rel="noreferrer">
                {card}
              </Link>
            ) : (
              <div key={`${brand.id}-${index}`}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}