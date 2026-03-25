import { StorePanel } from "@/components/store/store-panel";
import { getProducts } from "@/lib/repositories/platform";

export default async function StorePage() {
  const { items: products } = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4">Store</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Sell books today, expand into merch tomorrow.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          The commerce layer supports simple catalog management, order records, and payment verification without fragmenting the brand experience.
        </p>
      </div>

      <div className="mt-10">
        <StorePanel products={products} />
      </div>
    </div>
  );
}