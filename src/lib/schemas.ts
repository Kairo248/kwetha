import { z } from "zod";

const validDate = (value: string) => !Number.isNaN(Date.parse(value));

export const eventRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.email("Enter a valid email address."),
  dob: z.string().refine(validDate, "Date of birth is required."),
  city: z.string().min(2, "City is required."),
});

export const checkoutSchema = z.object({
  email: z.email("Enter a valid email address."),
  amount: z.number().positive("Amount must be positive."),
  reference: z.string().min(6, "Payment reference is required."),
  callbackUrl: z.url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const paymentInitializationSchema = z.object({
  user_id: z.string().uuid("User id must be a valid UUID."),
  event_id: z.string().uuid("Event id must be a valid UUID.").optional(),
  item_id: z.string().uuid("Item id must be a valid UUID.").optional(),
  amount: z.number().int("Amount must be provided in cents.").positive("Amount must be positive."),
  type: z.enum(["ticket", "product"]),
}).superRefine((values, context) => {
  if (values.type === "ticket" && !values.event_id) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["event_id"],
      message: "Event id is required for ticket payments.",
    });
  }

  if (values.type === "product" && !values.item_id) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["item_id"],
      message: "Item id is required for product payments.",
    });
  }
});

export const ticketValidationSchema = z.object({
  code: z.string().min(6, "Ticket reference is required."),
  eventId: z.string().uuid().optional().or(z.literal("")),
});

export const storeCheckoutSchema = z.object({
  email: z.email("Enter a valid email address."),
  customerName: z.string().min(2, "Customer name is required.").optional(),
  callbackUrl: z.url().optional(),
  items: z.array(
    z.object({
      id: z.string().uuid("Item id must be a valid UUID."),
      quantity: z.number().int().positive("Quantity must be at least 1."),
    }),
  ).min(1, "Add at least one item to checkout."),
});

export const ticketCheckoutSchema = eventRegistrationSchema.extend({
  eventId: z.string().uuid("Event id must be a valid UUID."),
  callbackUrl: z.url().optional(),
});

export const adminEventSchema = z.object({
  title: z.string().min(4, "Event title is required."),
  summary: z.string().min(12, "Add a fuller event summary."),
  venue: z.string().min(2, "Venue is required."),
  startsAt: z.string().refine(validDate, "Start date and time are required."),
  capacity: z.number().int().positive("Capacity must be at least 1."),
  youthQuota: z.number().int().min(0, "Youth quota cannot be negative."),
  seniorQuota: z.number().int().min(0, "Senior quota cannot be negative."),
  ticketPrice: z.number().min(0, "Ticket price cannot be negative."),
  published: z.boolean(),
  bannerImagePath: z.string().optional(),
}).refine((values) => values.youthQuota + values.seniorQuota <= values.capacity, {
  path: ["seniorQuota"],
  message: "Youth and senior quotas cannot exceed total capacity.",
});

export const adminMerchSchema = z.object({
  title: z.string().min(4, "Product title is required."),
  description: z.string().min(12, "Add a fuller merch description."),
  price: z.number().min(0, "Price cannot be negative."),
  inventory: z.number().int().min(0, "Inventory cannot be negative."),
  isActive: z.boolean(),
  imagePath: z.string().optional(),
});

export const adminContentSchema = z.object({
  title: z.string().min(4, "Content title is required."),
  excerpt: z.string().min(12, "Add a fuller description."),
  kind: z.enum(["article", "video", "gallery", "image"]),
  category: z.string().min(2, "Category is required."),
  assetPath: z.string().optional(),
  featured: z.boolean(),
  publishNow: z.boolean(),
});

export const adminBrandSchema = z.object({
  name: z.string().min(2, "Brand name is required."),
  description: z.string().min(8, "Add a short brand description."),
  websiteUrl: z.url("Enter a valid website URL.").optional().or(z.literal("")),
  logoPath: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0, "Sort order cannot be negative."),
});

export const adminHomeHeroSchema = z.object({
  eyebrow: z.string().min(2, "Hero eyebrow is required."),
  title: z.string().min(12, "Hero title needs more detail."),
  description: z.string().min(20, "Hero description needs more detail."),
  primaryCtaLabel: z.string().min(2, "Primary CTA label is required."),
  primaryCtaHref: z.string().min(1, "Primary CTA link is required."),
  secondaryCtaLabel: z.string().min(2, "Secondary CTA label is required."),
  secondaryCtaHref: z.string().min(1, "Secondary CTA link is required."),
  mediaPath: z.string().optional(),
  mediaKind: z.enum(["image", "video"]),
  mediaEyebrow: z.string().min(2, "Hero media label is required."),
  mediaTitle: z.string().min(2, "Hero media title is required."),
  metricOneValue: z.string().min(1, "Metric one value is required."),
  metricOneLabel: z.string().min(2, "Metric one label is required."),
  metricTwoValue: z.string().min(1, "Metric two value is required."),
  metricTwoLabel: z.string().min(2, "Metric two label is required."),
  metricThreeValue: z.string().min(1, "Metric three value is required."),
  metricThreeLabel: z.string().min(2, "Metric three label is required."),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PaymentInitializationInput = z.infer<typeof paymentInitializationSchema>;
export type TicketValidationInput = z.infer<typeof ticketValidationSchema>;
export type StoreCheckoutInput = z.infer<typeof storeCheckoutSchema>;
export type TicketCheckoutInput = z.infer<typeof ticketCheckoutSchema>;
export type AdminEventInput = z.infer<typeof adminEventSchema>;
export type AdminMerchInput = z.infer<typeof adminMerchSchema>;
export type AdminContentInput = z.infer<typeof adminContentSchema>;
export type AdminBrandInput = z.infer<typeof adminBrandSchema>;
export type AdminHomeHeroInput = z.infer<typeof adminHomeHeroSchema>;