export type AppRole = "viewer" | "customer" | "admin";
export type AudienceCategory = "youth" | "senior";
export type TicketStatus = "valid" | "used" | "cancelled";

export type PlatformEvent = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  venue: string;
  dateLabel: string;
  imagePath?: string | null;
  imageUrl?: string | null;
  published?: boolean;
  capacity: number;
  youthQuota: number;
  seniorQuota: number;
  price: number;
};

export type ProductItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imagePath?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  price: number;
  inventory: number;
};

export type ContentItem = {
  id: string;
  kind: "article" | "video" | "gallery" | "image";
  title: string;
  excerpt: string;
  category?: string | null;
  assetUrl?: string | null;
  assetPath?: string | null;
  imageUrl?: string | null;
};

export type BrandItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoPath?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  sortOrder: number;
};

export type HomeHero = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  mediaPath?: string | null;
  mediaUrl?: string | null;
  mediaKind: "image" | "video";
  mediaEyebrow: string;
  mediaTitle: string;
  metricOneValue: string;
  metricOneLabel: string;
  metricTwoValue: string;
  metricTwoLabel: string;
  metricThreeValue: string;
  metricThreeLabel: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AdminStat = {
  label: string;
  value: string;
  detail: string;
};

export type CustomerInteraction = {
  id: string;
  customerName: string;
  customerEmail: string;
  itemName: string;
  itemIdentifier: string;
  orderReference: string;
  status: string;
  amount: string;
  createdAtLabel: string;
  quantity?: number | null;
  context?: string | null;
};

export type OrderSummary = {
  id: string;
  customer: string;
  type: string;
  total: string;
  status: string;
  paymentReference?: string;
};

export type ProfileSummary = {
  id: string;
  userId: string;
  fullName: string | null;
  role: AppRole;
};

export type StoreCheckoutItem = {
  id: string;
  quantity: number;
};

export type TicketRecord = {
  id: string;
  reference: string;
  eventId: string;
  eventTitle: string;
  holderName: string;
  status: TicketStatus;
  audienceCategory: AudienceCategory;
};

export type CheckoutOrderState = {
  id: string;
  kind: string;
  status: string;
  totalCents: number;
  paymentReference: string;
  customerEmail: string | null;
  ticketId: string | null;
  ticketReference: string | null;
  /** Data URL PNG for display / print; null if not yet generated. */
  ticketQrCodeDataUrl: string | null;
  ticketEventTitle: string | null;
  confirmationEmailSentAt: string | null;
};