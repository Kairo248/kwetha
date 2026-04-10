import type { BrandItem, ContentItem, HomeHero, PlatformEvent, ProductItem, TicketRecord } from "@/types/domain";

export const homeHero: HomeHero = {
  id: "default",
  eyebrow: "Premium Brand Infrastructure",
  title: "A modern digital home for Lilitha's story, products, and live experiences.",
  description:
    "Designed to look premium in public, stay rigorous behind the scenes, and scale from intimate launches to high-demand ticket drops.",
  primaryCtaLabel: "Explore events",
  primaryCtaHref: "/events",
  secondaryCtaLabel: "Shop the store",
  secondaryCtaHref: "/store",
  mediaKind: "image",
  mediaEyebrow: "Campaign preview",
  mediaTitle: "Story in motion",
  mediaUrl: "/images/content-studio-session.svg",
  metricOneValue: "24+",
  metricOneLabel: "Content collections",
  metricTwoValue: "5k+",
  metricTwoLabel: "Scalable users",
  metricThreeValue: "500",
  metricThreeLabel: "Quota-aware tickets",
};

export const platformEvents: PlatformEvent[] = [];

export const productItems: ProductItem[] = [];

export const contentItems: ContentItem[] = [];

export const brandItems: BrandItem[] = [];

export const ticketRecords: TicketRecord[] = [];

export const dashboardMetrics = [
  { label: "Gross sales", value: "R 184k", detail: "Combined preview revenue across books and tickets." },
  { label: "Open ticket inventory", value: "312", detail: "Remaining across current event allocations." },
  { label: "Content assets", value: "48", detail: "Articles, videos, and image sets in rotation." },
];

export const recentOrders = [
  {
    id: "ORD-1001",
    customer: "Nokuthula M.",
    type: "Book",
    total: "R 349.00",
    status: "paid",
  },
  {
    id: "ORD-1002",
    customer: "Sipho D.",
    type: "Ticket",
    total: "R 450.00",
    status: "paid",
  },
  {
    id: "ORD-1003",
    customer: "Lebo T.",
    type: "Bundle",
    total: "R 548.00",
    status: "pending",
  },
];