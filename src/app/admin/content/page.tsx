import { BrandCreationForm } from "@/components/admin/brand-creation-form";
import { BrandSliderPanel } from "@/components/admin/brand-slider-panel";
import { ContentCreationForm } from "@/components/admin/content-creation-form";
import { ContentLibraryPanel } from "@/components/admin/content-library-panel";
import { HeroEditorForm } from "@/components/admin/hero-editor-form";
import { StatsGrid } from "@/components/admin/stats-grid";
import { getBrands, getContentCollection, getHomeHero } from "@/lib/repositories/platform";

export default async function AdminContentPage() {
  const [{ items: contentItems, source: contentSource }, { items: brands, source: brandsSource }, { item: hero }] = await Promise.all([
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3 sm:mb-4">Admin / Content</p>
        <h1 className="display-title text-[2rem] leading-[1.1] tracking-tight sm:text-5xl sm:leading-none md:text-6xl">
          Manage brand-facing content, media uploads, and logo partners in one workspace.
        </h1>
        <p className="mt-4 text-[0.9375rem] leading-7 text-muted sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
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

          <div className="mt-8">
            <ContentLibraryPanel items={contentItems} allowDelete={contentSource === "supabase"} />
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

          <div className="mt-8">
            <BrandSliderPanel items={brands} allowDelete={brandsSource === "supabase"} />
          </div>
        </section>
      </div>
    </div>
  );
}