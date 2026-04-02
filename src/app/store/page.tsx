import { StorePanel } from "@/components/store/store-panel";
import { getProducts } from "@/lib/repositories/platform";

export default async function StorePage() {
  const { items: products } = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3 sm:mb-4">Store</p>
        <h1 className="display-title text-[2rem] leading-[1.1] tracking-tight sm:text-5xl sm:leading-none md:text-6xl">
          Sell books today, expand into merch tomorrow.
        </h1>
        <p className="mt-4 text-[0.9375rem] leading-7 text-muted sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
          The commerce layer supports simple catalog management, order records, and payment verification without fragmenting the brand experience.
        </p>
      </div>

      <div className="mt-10">
        <StorePanel products={products} />
      </div>
    </div>
  );
}