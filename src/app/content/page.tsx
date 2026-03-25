import Image from "next/image";
import { getContentCollection } from "@/lib/repositories/platform";

export default async function ContentPage() {
  const { items } = await getContentCollection();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Content</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Publish media collections that extend the brand beyond a single launch.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          This surface is designed for articles, video drops, and editorial galleries powered by Supabase Storage and database metadata.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="glass-panel rounded-4xl overflow-hidden">
            <div className="relative h-52 overflow-hidden bg-sand/60 dark:bg-sand/15">
              {item.kind === "video" && item.assetUrl ? (
                <video src={item.assetUrl} className="h-full w-full object-cover" muted playsInline controls />
              ) : item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="surface-grid h-full w-full p-6" />
              )}
              <div className="absolute left-6 top-6">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent-strong dark:bg-black/40">
                  {item.kind}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              {item.category ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">{item.category}</p> : null}
              <p className="mt-4 text-sm leading-7 text-muted">{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}