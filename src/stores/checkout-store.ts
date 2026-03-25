import { create } from "zustand";
import type { ProductItem } from "@/types/domain";

type CheckoutState = {
  items: ProductItem[];
  addItem: (item: ProductItem) => void;
  clear: () => void;
  total: () => number;
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.price, 0),
}));