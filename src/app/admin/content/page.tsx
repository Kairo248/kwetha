import Image from "next/image";
import { BrandCreationForm } from "@/components/admin/brand-creation-form";
import { ContentCreationForm } from "@/components/admin/content-creation-form";
import { HeroEditorForm } from "@/components/admin/hero-editor-form";
import { StatsGrid } from "@/components/admin/stats-grid";
import { getBrands, getContentCollection, getHomeHero } from "@/lib/repositories/platform";

export default async function AdminContentPage() {
  const [{ items: contentItems }, { items: brands }, { item: hero }] = await Promise.all([
    getContentCollection({ includeDrafts: true }),
    getBrands({ includeInactive: true }),
    getHomeHero(),
  ]);
  const contentStats = [
    {
      label: "Content items",
      value: String(contentItems.length),
      detail: "All image, video, gallery, and article entries in the admin library.",
    },
    {
      label: "Published items",
      value: String(contentItems.filter((item) => Boolean(item.assetUrl || item.imageUrl)).length),
      detail: "Entries that already have a public-facing media asset or preview image.",
    },
    {
      label: "Draft-focused items",
      value: String(contentItems.filter((item) => !item.assetUrl && !item.imageUrl).length),
      detail: "Entries still missing a live-facing media attachment.",
    },
    {
      label: "Brand partners",
      value: String(brands.length),
      detail: "Brands currently managed inside the homepage slider workspace.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Admin / Content</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Manage brand-facing content, media uploads, and logo partners in one workspace.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          This is the editorial and brand-collaboration layer for Lilitha’s campaign work. Upload images, videos, and partner brands that feed directly into the public experience.
        </p>
      </div>

      <div className="mt-10">
        <StatsGrid stats={contentStats} />
      </div>

      <div className="mt-10">
        <HeroEditorForm hero={hero} />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1fr]">
        <ContentCreationForm />
        <BrandCreationForm />
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel rounded-4xl p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Content Library</p>
              <h2 className="text-3xl font-semibold">Recent uploads</h2>
            </div>
            <div className="rounded-full border border-card-border px-4 py-2 text-sm font-semibold text-muted">
              {contentItems.length} items
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {contentItems.length ? contentItems.map((item) => (
              <article key={item.id} className="rounded-3xl border border-card-border p-5">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-sand/60 dark:bg-sand/15">
                    {item.kind === "video" && item.assetUrl ? (
                      <video src={item.assetUrl} className="h-full w-full object-cover" muted playsInline />
                    ) : item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="surface-grid h-full w-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-accent-strong">
                        {item.kind}
                      </span>
                      {item.category ? (
                        <span className="rounded-full border border-card-border px-3 py-1 text-xs font-semibold text-muted">
                          {item.category}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{item.excerpt}</p>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
                No content items yet. Create a new upload from the form above.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-4xl p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Brand Slider</p>
              <h2 className="text-3xl font-semibold">Active partners</h2>
            </div>
            <div className="rounded-full border border-card-border px-4 py-2 text-sm font-semibold text-muted">
              {brands.length} brands
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {brands.length ? brands.map((brand) => (
              <article key={brand.id} className="rounded-3xl border border-card-border p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-18 w-22 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-stone-950/90 p-3">
                    {brand.logoUrl ? (
                      <Image src={brand.logoUrl} alt={brand.name} width={96} height={40} className="max-h-10 w-auto object-contain" unoptimized />
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white">{brand.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{brand.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{brand.description}</p>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
                No active brands yet. Add one to power the homepage slider.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}