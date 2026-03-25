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

export const platformEvents: PlatformEvent[] = [
  {
    id: "d97c81b7-91f5-4544-8e56-e318b918fa5d",
    title: "Ikwetha Live: Story, Sound, and Strategy",
    slug: "ikwetha-live-story-sound-strategy",
    summary:
      "A flagship gathering designed for youth and senior audiences, with quota-based ticket allocation and an immersive brand-led experience.",
    venue: "Johannesburg",
    dateLabel: "22 August 2026",
    imageUrl: "/images/event-story-sound.svg",
    capacity: 500,
    youthQuota: 250,
    seniorQuota: 250,
    price: 450,
  },
  {
    id: "313d38e4-f5aa-4f55-bc4c-f6d1e87363bb",
    title: "Creators Table Session",
    slug: "creators-table-session",
    summary:
      "Smaller format workshop for community building, strategy, and direct audience engagement.",
    venue: "Cape Town",
    dateLabel: "05 September 2026",
    imageUrl: "/images/event-creators-table.svg",
    capacity: 120,
    youthQuota: 60,
    seniorQuota: 60,
    price: 300,
  },
];

export const productItems: ProductItem[] = [
  {
    id: "4548c6b9-28e8-4546-8f0f-2950e89811c8",
    title: "Lilitha: Notes on Becoming",
    slug: "lilitha-notes-on-becoming",
    description:
      "Lead book product with premium packaging, direct checkout flow, and room for future bundles.",
    category: "Books",
    imageUrl: "/images/product-notes-on-becoming.svg",
    price: 349,
    inventory: 200,
  },
  {
    id: "a5e3f5a4-c884-4694-a36b-5041844dfd51",
    title: "Campaign Journal Bundle",
    slug: "campaign-journal-bundle",
    description:
      "Companion stationery bundle designed for future merch expansion under the same store architecture.",
    category: "Merch",
    imageUrl: "/images/product-campaign-journal.svg",
    price: 199,
    inventory: 500,
  },
];

export const contentItems: ContentItem[] = [
  {
    id: "1",
    kind: "article",
    title: "Designing a personal brand with staying power",
    excerpt: "A long-form editorial entry introducing the Ikwetha worldview and future creator platform direction.",
    category: "Brand Strategy",
    imageUrl: "/images/content-brand-story.svg",
  },
  {
    id: "2",
    kind: "video",
    title: "Studio session: voice, texture, and campaign mood",
    excerpt: "Short-form media feature stored in Supabase Storage and surfaced dynamically on the public site.",
    category: "Campaign Video",
    imageUrl: "/images/content-studio-session.svg",
  },
  {
    id: "3",
    kind: "gallery",
    title: "Launch visuals and behind-the-scenes stills",
    excerpt: "Curated image collection with metadata, featuring logic, and category filters.",
    category: "Brand Gallery",
    imageUrl: "/images/content-gallery.svg",
  },
  {
    id: "4",
    kind: "article",
    title: "What scalable creator infrastructure should look like",
    excerpt: "Foundational operations thinking for future expansion across multiple creators and product lines.",
    category: "Thought Leadership",
    imageUrl: "/images/content-brand-story.svg",
  },
];

export const brandItems: BrandItem[] = [
  {
    id: "brand-1",
    name: "Aster & Co",
    slug: "aster-and-co",
    description: "Launch campaign and visual direction partner.",
    logoUrl: "/images/brand-aster.svg",
    websiteUrl: "https://example.com/aster",
    sortOrder: 1,
  },
  {
    id: "brand-2",
    name: "Northline Studio",
    slug: "northline-studio",
    description: "Creative strategy and storytelling systems.",
    logoUrl: "/images/brand-northline.svg",
    websiteUrl: "https://example.com/northline",
    sortOrder: 2,
  },
  {
    id: "brand-3",
    name: "Kindred House",
    slug: "kindred-house",
    description: "Culture-led experiences and editorial partnerships.",
    logoUrl: "/images/brand-kindred.svg",
    websiteUrl: "https://example.com/kindred",
    sortOrder: 3,
  },
  {
    id: "brand-4",
    name: "Halo Motion",
    slug: "halo-motion",
    description: "Short-form video and campaign production.",
    logoUrl: "/images/brand-halo.svg",
    websiteUrl: "https://example.com/halo",
    sortOrder: 4,
  },
];

export const ticketRecords: TicketRecord[] = [
  {
    id: "1",
    reference: "IKW-2026-0001",
    eventId: platformEvents[0].id,
    eventTitle: platformEvents[0].title,
    holderName: "Preview Guest",
    status: "valid",
    audienceCategory: "youth",
  },
  {
    id: "2",
    reference: "IKW-2026-0002",
    eventId: platformEvents[0].id,
    eventTitle: platformEvents[0].title,
    holderName: "Existing Attendee",
    status: "used",
    audienceCategory: "senior",
  },
];

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