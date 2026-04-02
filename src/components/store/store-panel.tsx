"use client";

import { startTransition, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckoutStore } from "@/stores/checkout-store";
import type { ProductItem } from "@/types/domain";

type StorePanelProps = {
  products: ProductItem[];
};

export function StorePanel({ products }: StorePanelProps) {
  const items = useCheckoutStore((state) => state.items);
  const addItem = useCheckoutStore((state) => state.addItem);
  const clear = useCheckoutStore((state) => state.clear);
  const total = useCheckoutStore((state) => state.total);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkoutItems = Object.values(
    items.reduce<Record<string, { id: string; quantity: number }>>((accumulator, item) => {
      const existing = accumulator[item.id];
      accumulator[item.id] = {
        id: item.id,
        quantity: existing ? existing.quantity + 1 : 1,
      };
      return accumulator;
    }, {}),
  );

  const handleCheckout = () => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!email) {
      toast.error("Enter your email before checkout.");
      return;
    }

    startTransition(async () => {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/checkout/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            customerName: email.split("@")[0],
            items: checkoutItems,
            callbackUrl: `${window.location.origin}/checkout/complete`,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Sign in required", {
              description: "Use the Sign in link to save checkout data to your account.",
            });
            window.location.assign("/login?next=/account");
            return;
          }
          throw new Error(payload.message ?? "Unable to initialize checkout.");
        }

        clear();
        window.location.assign(payload.data.authorization_url as string);
      } catch (error) {
        toast.error("Checkout failed", {
          description: error instanceof Error ? error.message : "Try again shortly.",
        });
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {products.map((product) => (
          <article
            key={product.id}
            className="glass-panel flex min-w-0 h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-4xl"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                width={640}
                height={420}
                className="h-28 w-full object-cover sm:h-40 md:h-48 lg:h-52"
                unoptimized
              />
            ) : (
              <div className="surface-grid h-28 bg-sand/60 sm:h-40 md:h-48 lg:h-52 dark:bg-sand/15" />
            )}
            <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight sm:text-lg md:text-xl lg:text-2xl">
                    {product.title}
                  </h2>
                  <p className="mt-0.5 text-[0.65rem] text-muted sm:mt-1 sm:text-sm">{product.category}</p>
                </div>
                <div className="shrink-0 text-xs font-semibold tabular-nums sm:text-base md:text-lg lg:text-xl">
                  R {product.price.toFixed(2)}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-[0.65rem] leading-5 text-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-7">
                {product.description}
              </p>
              <Button className="mt-3 w-full text-xs sm:mt-4 sm:text-sm md:mt-6" onClick={() => addItem(product)}>
                Add to cart
              </Button>
            </div>
          </article>
        ))}
      </div>

      <aside className="glass-panel h-fit rounded-3xl p-5 sm:rounded-4xl sm:p-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-5 w-5 text-accent-strong" />
          <h3 className="text-xl font-semibold">Cart</h3>
        </div>
        <div className="mt-6 space-y-4">
          {items.length ? (
            items.map((item) => (
              <div key={`${item.id}-${item.price}`} className="rounded-3xl border border-card-border p-4">
                <div className="font-semibold">{item.title}</div>
                <div className="mt-1 text-sm text-muted">R {item.price.toFixed(2)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-card-border p-4 text-sm text-muted">
              Your cart is empty.
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="text-xl font-semibold">R {total().toFixed(2)}</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">
          Checkout is tied to a signed-in customer account so orders can be saved and
          recovered later. <Link href="/login?next=/account" className="font-semibold text-accent-strong">Sign in</Link> if needed.
        </p>
        <div className="mt-6">
          <Input
            label="Checkout email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button className="mt-6 w-full" variant="secondary" onClick={handleCheckout} disabled={isSubmitting}>
          {isSubmitting ? "Starting checkout..." : "Proceed to checkout"}
        </Button>
      </aside>
    </div>
  );
}