import Image from "next/image";
import { getContentCollection } from "@/lib/repositories/platform";

export default async function ContentPage() {
  const { items } = await getContentCollection();
  const [featured, ...rest] = items;

  return (
    <div className="mx-auto max-w-384 px-4 py-8 sm:py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Feeds</p>
        <h1 className="display-title text-4xl leading-none sm:text-6xl">
          Big-screen feeds designed to immerse people in each drop.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          Explore personal moments and partnership campaigns in a visual layout that makes every story feel substantial.
        </p>
      </div>

      {!items.length ? (
        <div className="glass-panel mt-10 rounded-4xl p-8 md:p-10">
          <h2 className="text-2xl font-semibold md:text-3xl">No feeds yet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
            Your feed is still empty for now. Add your first post from the admin content area and it will appear here automatically.
          </p>
        </div>
      ) : null}

      {featured ? (
        <article className="glass-panel mt-10 overflow-hidden rounded-4xl">
          <div className="relative h-96 overflow-hidden bg-sand/60 md:h-144 dark:bg-sand/15">
            {featured.kind === "video" && featured.assetUrl ? (
              <video src={featured.assetUrl} className="h-full w-full object-cover" muted playsInline controls />
            ) : featured.imageUrl ? (
              <Image src={featured.imageUrl} alt={featured.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="surface-grid h-full w-full p-6" />
            )}
            <div className="absolute left-6 top-6 flex gap-2">
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent-strong dark:bg-black/40">
                {featured.kind}
              </span>
              {featured.category ? (
                <span className="rounded-full bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white">
                  {featured.category}
                </span>
              ) : null}
            </div>
          </div>
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-semibold md:text-4xl">{featured.title}</h2>
            <p className="mt-4 max-w-4xl text-sm leading-8 text-muted md:text-base">{featured.excerpt}</p>
          </div>
        </article>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {rest.map((item) => (
          <article key={item.id} className="glass-panel overflow-hidden rounded-4xl">
            <div className="relative h-72 overflow-hidden bg-sand/60 sm:h-80 dark:bg-sand/15">
              {item.kind === "video" && item.assetUrl ? (
                <video src={item.assetUrl} className="h-full w-full object-cover" muted playsInline controls />
              ) : item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="surface-grid h-full w-full p-6" />
              )}
              <div className="absolute left-6 top-6 flex gap-2">
                <span className="rounded-full bg-white/85 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent-strong dark:bg-black/40">
                  {item.kind}
                </span>
                {item.category ? (
                  <span className="rounded-full bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white">
                    {item.category}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="p-6 md:p-7">
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}