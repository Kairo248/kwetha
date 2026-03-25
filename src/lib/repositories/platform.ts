import { getAdminAssetPublicUrl } from "@/lib/admin-assets";
import {
  brandItems,
  contentItems,
  dashboardMetrics,
  homeHero,
  platformEvents,
  productItems,
  recentOrders,
  ticketRecords,
} from "@/lib/data/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AdminStat,
  BrandItem,
  CheckoutOrderState,
  ContentItem,
  CustomerInteraction,
  DashboardMetric,
  HomeHero,
  OrderSummary,
  PlatformEvent,
  ProductItem,
  TicketRecord,
} from "@/types/domain";

type DataSource = "preview" | "supabase";

function formatRandFromCents(value: number) {
  return `R ${(value / 100).toFixed(2)}`;
}

function formatDateLabel(input: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(input));
}

function formatDateTimeLabel(input: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input));
}

function getCustomerMetadata(metadata: Record<string, unknown>) {
  return {
    customerName: String(metadata.customerName ?? metadata.fullName ?? metadata.email ?? "Unknown customer"),
    customerEmail: String(metadata.email ?? "No email provided"),
  };
}

function buildPreviewEventInsights(): { stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource } {
  const ticketRevenue = ticketRecords.reduce((sum, ticket) => {
    const event = platformEvents.find((entry) => entry.id === ticket.eventId);
    return sum + Math.round((event?.price ?? 0) * 100);
  }, 0);

  return {
    source: "preview",
    stats: [
      {
        label: "Published events",
        value: String(platformEvents.length),
        detail: "Preview event records currently visible to operations.",
      },
      {
        label: "Upcoming events",
        value: String(platformEvents.length),
        detail: "All preview events are treated as active upcoming events.",
      },
      {
        label: "Tickets sold",
        value: String(ticketRecords.length),
        detail: "Customer ticket purchases recorded in preview mode.",
      },
      {
        label: "Ticket revenue",
        value: formatRandFromCents(ticketRevenue),
        detail: "Estimated from preview ticket records and event pricing.",
      },
    ],
    interactions: ticketRecords.map((ticket, index) => {
      const event = platformEvents.find((entry) => entry.id === ticket.eventId);
      return {
        id: ticket.id,
        customerName: ticket.holderName,
        customerEmail: `guest${index + 1}@preview.ikweta`,
        itemName: ticket.eventTitle,
        itemIdentifier: ticket.reference,
        orderReference: `PREVIEW-TKT-${index + 1}`,
        status: ticket.status,
        amount: formatRandFromCents(Math.round((event?.price ?? 0) * 100)),
        createdAtLabel: "Preview data",
        context: `${ticket.audienceCategory} ticket`,
      } satisfies CustomerInteraction;
    }),
  };
}

function buildPreviewMerchInsights(): { stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource } {
  const previewItems = [
    {
      id: "preview-merch-1",
      customerName: "Nokuthula M.",
      customerEmail: "nokuthula@example.com",
      itemName: productItems[1]?.title ?? "Campaign Journal Bundle",
      itemIdentifier: productItems[1]?.id ?? "preview-item-1",
      orderReference: "PREVIEW-ORD-1001",
      status: "paid",
      amount: formatRandFromCents(39800),
      createdAtLabel: "Preview data",
      quantity: 2,
      context: "Merch order",
    },
    {
      id: "preview-merch-2",
      customerName: "Lebo T.",
      customerEmail: "lebo@example.com",
      itemName: productItems[0]?.title ?? "Lilitha: Notes on Becoming",
      itemIdentifier: productItems[0]?.id ?? "preview-item-2",
      orderReference: "PREVIEW-ORD-1002",
      status: "pending",
      amount: formatRandFromCents(34900),
      createdAtLabel: "Preview data",
      quantity: 1,
      context: "Store order",
    },
  ] satisfies CustomerInteraction[];

  return {
    source: "preview",
    stats: [
      {
        label: "Active merch items",
        value: String(productItems.filter((item) => item.category.toLowerCase() === "merch").length),
        detail: "Preview catalog items marked as merch in the admin view.",
      },
      {
        label: "Units ordered",
        value: String(previewItems.reduce((sum, row) => sum + (row.quantity ?? 0), 0)),
        detail: "Combined quantity across preview merch interactions.",
      },
      {
        label: "Paid merch revenue",
        value: formatRandFromCents(39800),
        detail: "Paid preview merch transactions only.",
      },
      {
        label: "Customers reached",
        value: String(new Set(previewItems.map((row) => row.customerEmail)).size),
        detail: "Unique preview buyers across current merch orders.",
      },
    ],
    interactions: previewItems,
  };
}

function buildPreviewOrderInsights(): { stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource } {
  const interactions = [
    {
      id: "preview-order-1",
      customerName: "Nokuthula M.",
      customerEmail: "nokuthula@example.com",
      itemName: productItems[0]?.title ?? "Book order",
      itemIdentifier: productItems[0]?.id ?? "preview-item-1",
      orderReference: "ORD-1001",
      status: "paid",
      amount: "R 349.00",
      createdAtLabel: "Preview data",
      quantity: 1,
      context: "store",
    },
    {
      id: "preview-order-2",
      customerName: "Sipho D.",
      customerEmail: "sipho@example.com",
      itemName: platformEvents[0]?.title ?? "Event ticket",
      itemIdentifier: ticketRecords[0]?.reference ?? "IKW-2026-0001",
      orderReference: "ORD-1002",
      status: "paid",
      amount: "R 450.00",
      createdAtLabel: "Preview data",
      quantity: 1,
      context: "ticket",
    },
    {
      id: "preview-order-3",
      customerName: "Lebo T.",
      customerEmail: "lebo@example.com",
      itemName: productItems[1]?.title ?? "Bundle",
      itemIdentifier: productItems[1]?.id ?? "preview-item-2",
      orderReference: "ORD-1003",
      status: "pending",
      amount: "R 548.00",
      createdAtLabel: "Preview data",
      quantity: 1,
      context: "store",
    },
  ] satisfies CustomerInteraction[];

  return {
    source: "preview",
    stats: [
      {
        label: "Total orders",
        value: String(recentOrders.length),
        detail: "Preview orders currently tracked in the sample workspace.",
      },
      {
        label: "Paid orders",
        value: String(recentOrders.filter((order) => order.status === "paid").length),
        detail: "Orders that have completed payment in preview mode.",
      },
      {
        label: "Pending orders",
        value: String(recentOrders.filter((order) => order.status === "pending").length),
        detail: "Orders still waiting for payment or fulfillment work.",
      },
      {
        label: "Gross sales",
        value: "R 1,347.00",
        detail: "Combined order value across preview sales records.",
      },
    ],
    interactions,
  };
}

function buildPreviewTicketInsights(): { stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource } {
  const soldCount = ticketRecords.length;
  const checkedInCount = ticketRecords.filter((ticket) => ticket.status === "used").length;
  const validCount = ticketRecords.filter((ticket) => ticket.status === "valid").length;

  return {
    source: "preview",
    stats: [
      {
        label: "Tickets sold",
        value: String(soldCount),
        detail: "All ticket purchases currently visible to ticketing ops.",
      },
      {
        label: "Valid tickets",
        value: String(validCount),
        detail: "Tickets that can still be scanned at the venue.",
      },
      {
        label: "Checked in",
        value: String(checkedInCount),
        detail: "Tickets already marked used by the scanner workflow.",
      },
      {
        label: "Ticket revenue",
        value: formatRandFromCents(ticketRecords.reduce((sum, ticket) => {
          const event = platformEvents.find((entry) => entry.id === ticket.eventId);
          return sum + Math.round((event?.price ?? 0) * 100);
        }, 0)),
        detail: "Estimated from preview event pricing and ticket records.",
      },
    ],
    interactions: buildPreviewEventInsights().interactions,
  };
}

export async function getEvents(options?: { includeUnpublished?: boolean }): Promise<{ items: PlatformEvent[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { items: platformEvents, source: "preview" };
  }

  let query = supabase
    .from("events")
    .select("id, title, slug, summary, venue, starts_at, banner_image_path, published, capacity, youth_quota, senior_quota, ticket_price_cents")
    .order("starts_at", { ascending: true });

  if (!options?.includeUnpublished) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return { items: platformEvents, source: "preview" };
  }

  return {
    source: "supabase",
    items: data.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      summary: event.summary ?? "",
      venue: event.venue,
      dateLabel: formatDateLabel(event.starts_at),
      imagePath: event.banner_image_path,
      imageUrl: getAdminAssetPublicUrl(supabase, event.banner_image_path),
      published: event.published,
      capacity: event.capacity,
      youthQuota: event.youth_quota,
      seniorQuota: event.senior_quota,
      price: event.ticket_price_cents / 100,
    })),
  };
}

export async function getProducts(options?: { includeInactive?: boolean }): Promise<{ items: ProductItem[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { items: productItems, source: "preview" };
  }

  let query = supabase
    .from("items")
    .select("id, title, slug, description, image_path, item_type, price_cents, inventory_count, is_active")
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return { items: productItems, source: "preview" };
  }

  return {
    source: "supabase",
    items: data.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description ?? "",
      category: item.item_type,
      imagePath: item.image_path,
      imageUrl: getAdminAssetPublicUrl(supabase, item.image_path),
      isActive: item.is_active,
      price: item.price_cents / 100,
      inventory: item.inventory_count,
    })),
  };
}

export async function getContentCollection(options?: { includeDrafts?: boolean }): Promise<{ items: ContentItem[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { items: contentItems, source: "preview" };
  }

  let query = supabase
    .from("content")
    .select("id, content_kind, title, excerpt, category, storage_path, metadata, published_at")
    .order("created_at", { ascending: false });

  if (!options?.includeDrafts) {
    query = query.not("published_at", "is", null);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return { items: contentItems, source: "preview" };
  }

  return {
    source: "supabase",
    items: data.map((item) => ({
      id: item.id,
      kind: item.content_kind,
      title: item.title,
      excerpt: item.excerpt ?? "",
      category: item.category,
      assetPath: item.storage_path,
      assetUrl: item.storage_path ? getAdminAssetPublicUrl(supabase, item.storage_path) : null,
      imageUrl:
        item.metadata && typeof item.metadata === "object" && typeof item.metadata.imageUrl === "string"
          ? item.metadata.imageUrl
          : item.storage_path && item.content_kind !== "video"
            ? getAdminAssetPublicUrl(supabase, item.storage_path)
            : null,
    })),
  };
}

export async function getBrands(options?: { includeInactive?: boolean }): Promise<{ items: BrandItem[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { items: brandItems, source: "preview" };
  }

  let query = supabase
    .from("brands")
    .select("id, name, slug, description, logo_path, website_url, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return { items: brandItems, source: "preview" };
  }

  return {
    source: "supabase",
    items: data.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? "",
      logoPath: brand.logo_path,
      logoUrl: getAdminAssetPublicUrl(supabase, brand.logo_path),
      websiteUrl: brand.website_url ?? undefined,
      sortOrder: brand.sort_order,
    })),
  };
}

export async function getOrderSummaries(): Promise<{ items: OrderSummary[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { items: recentOrders, source: "preview" };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_cents, payment_reference, metadata")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data?.length) {
    return { items: recentOrders, source: "preview" };
  }

  return {
    source: "supabase",
    items: data.map((order) => {
      const metadata = (order.metadata ?? {}) as Record<string, unknown>;
      return {
        id: order.id,
        customer: String(metadata.customerName ?? metadata.fullName ?? metadata.email ?? "Unknown customer"),
        type: String(metadata.kind ?? "order"),
        total: formatRandFromCents(order.total_cents),
        status: order.status,
        paymentReference: order.payment_reference ?? undefined,
      };
    }),
  };
}

export async function getTicketRecordByReference(reference: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return ticketRecords.find((entry) => entry.reference === reference) ?? null;
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, reference, event_id, attendee_name, status, audience_category")
    .eq("reference", reference)
    .maybeSingle();

  if (error || !ticket) {
    return ticketRecords.find((entry) => entry.reference === reference) ?? null;
  }

  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", ticket.event_id)
    .maybeSingle();

  return {
    id: ticket.id,
    reference: ticket.reference,
    eventId: ticket.event_id,
    eventTitle: event?.title ?? "Unknown event",
    holderName: ticket.attendee_name ?? "Unknown attendee",
    status: ticket.status,
    audienceCategory: ticket.audience_category,
  } satisfies TicketRecord;
}

export async function getOrderByPaymentReference(reference: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, total_cents, payment_reference, metadata")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error || !order || !order.payment_reference) {
    return null;
  }

  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  let ticketReference: string | null = null;

  if (String(metadata.kind ?? "") === "ticket") {
    const { data: ticketOrder } = await supabase
      .from("ticket_orders")
      .select("ticket_id")
      .eq("order_id", order.id)
      .maybeSingle();

    if (ticketOrder?.ticket_id) {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("reference")
        .eq("id", ticketOrder.ticket_id)
        .maybeSingle();

      ticketReference = ticket?.reference ?? null;
    }
  }

  return {
    id: order.id,
    kind: String(metadata.kind ?? "order"),
    status: order.status,
    totalCents: order.total_cents,
    paymentReference: order.payment_reference,
    customerEmail:
      typeof metadata.email === "string"
        ? metadata.email
        : typeof metadata.customerEmail === "string"
          ? metadata.customerEmail
          : null,
    ticketReference,
    confirmationEmailSentAt:
      typeof metadata.confirmationEmailSentAt === "string"
        ? metadata.confirmationEmailSentAt
        : null,
  } satisfies CheckoutOrderState;
}

export async function getDashboardMetrics(): Promise<{ metrics: DashboardMetric[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { metrics: dashboardMetrics, source: "preview" };
  }

  const [{ count: orderCount }, { count: validTickets }, { count: contentCount }, { data: paidOrders }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "valid"),
      supabase.from("content").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_cents").eq("status", "paid"),
    ]);

  const grossSalesCents = (paidOrders ?? []).reduce((sum, order) => sum + order.total_cents, 0);

  return {
    source: "supabase",
    metrics: [
      {
        label: "Gross sales",
        value: formatRandFromCents(grossSalesCents),
        detail: `${orderCount ?? 0} total orders tracked in the platform.`,
      },
      {
        label: "Open ticket inventory",
        value: String(validTickets ?? 0),
        detail: "Tickets that are still valid and not yet scanned.",
      },
      {
        label: "Content assets",
        value: String(contentCount ?? 0),
        detail: "Published content records available in the CMS layer.",
      },
    ],
  };
}

export async function getEventAdminInsights(): Promise<{ stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return buildPreviewEventInsights();
  }

  const [eventsResult, ticketsResult, ticketOrdersResult] = await Promise.all([
    supabase.from("events").select("id, title, published, starts_at"),
    supabase
      .from("tickets")
      .select("id, reference, event_id, attendee_name, attendee_email, status, audience_category, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("ticket_orders").select("ticket_id, order_id, amount_cents"),
  ]);

  if (eventsResult.error || ticketsResult.error || ticketOrdersResult.error) {
    return buildPreviewEventInsights();
  }

  const eventMap = new Map((eventsResult.data ?? []).map((event) => [event.id, event]));
  const ticketOrderMap = new Map((ticketOrdersResult.data ?? []).map((entry) => [entry.ticket_id, entry]));
  const soldCount = ticketOrdersResult.data?.length ?? 0;
  const revenueCents = (ticketOrdersResult.data ?? []).reduce((sum, entry) => sum + entry.amount_cents, 0);
  const publishedCount = (eventsResult.data ?? []).filter((event) => event.published).length;
  const upcomingCount = (eventsResult.data ?? []).filter((event) => new Date(event.starts_at).getTime() >= Date.now()).length;

  return {
    source: "supabase",
    stats: [
      {
        label: "Published events",
        value: String(publishedCount),
        detail: "Events currently visible on the public site.",
      },
      {
        label: "Upcoming events",
        value: String(upcomingCount),
        detail: "Events still ahead of the current date and time.",
      },
      {
        label: "Tickets sold",
        value: String(soldCount),
        detail: "Orders that have resulted in issued tickets.",
      },
      {
        label: "Ticket revenue",
        value: formatRandFromCents(revenueCents),
        detail: "Revenue recorded through ticket orders.",
      },
    ],
    interactions: (ticketsResult.data ?? []).map((ticket) => {
      const event = eventMap.get(ticket.event_id);
      const link = ticketOrderMap.get(ticket.id);
      return {
        id: ticket.id,
        customerName: ticket.attendee_name ?? "Unknown attendee",
        customerEmail: ticket.attendee_email ?? "No email provided",
        itemName: event?.title ?? "Unknown event",
        itemIdentifier: ticket.reference,
        orderReference: link?.order_id ?? "No order linked",
        status: ticket.status,
        amount: formatRandFromCents(link?.amount_cents ?? 0),
        createdAtLabel: formatDateTimeLabel(ticket.created_at),
        context: `${ticket.audience_category} ticket`,
      } satisfies CustomerInteraction;
    }),
  };
}

export async function getMerchAdminInsights(): Promise<{ stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return buildPreviewMerchInsights();
  }

  const [itemsResult, orderItemsResult] = await Promise.all([
    supabase.from("items").select("id, title, item_type, is_active").eq("item_type", "merch"),
    supabase.from("order_items").select("id, order_id, item_id, quantity, unit_price_cents, created_at").order("created_at", { ascending: false }),
  ]);

  if (itemsResult.error || orderItemsResult.error) {
    return buildPreviewMerchInsights();
  }

  const merchItems = itemsResult.data ?? [];
  const merchItemIds = new Set(merchItems.map((item) => item.id));
  const merchOrderItems = (orderItemsResult.data ?? []).filter((entry) => merchItemIds.has(entry.item_id));
  const orderIds = [...new Set(merchOrderItems.map((entry) => entry.order_id))];

  const { data: ordersData, error: ordersError } = orderIds.length
    ? await supabase
        .from("orders")
        .select("id, status, payment_reference, metadata, created_at")
        .in("id", orderIds)
    : { data: [], error: null };

  if (ordersError) {
    return buildPreviewMerchInsights();
  }

  const orderMap = new Map((ordersData ?? []).map((order) => [order.id, order]));
  const paidRows = merchOrderItems.filter((entry) => {
    const order = orderMap.get(entry.order_id);
    return order?.status === "paid" || order?.status === "fulfilled";
  });
  const uniqueCustomers = new Set(
    paidRows.map((entry) => {
      const order = orderMap.get(entry.order_id);
      const metadata = (order?.metadata ?? {}) as Record<string, unknown>;
      return String(metadata.email ?? order?.id ?? entry.id);
    }),
  );

  return {
    source: "supabase",
    stats: [
      {
        label: "Active merch items",
        value: String(merchItems.filter((item) => item.is_active).length),
        detail: "Merch products currently live in the storefront.",
      },
      {
        label: "Units ordered",
        value: String(merchOrderItems.reduce((sum, entry) => sum + entry.quantity, 0)),
        detail: "Total item quantity ordered across all merch purchases.",
      },
      {
        label: "Paid merch revenue",
        value: formatRandFromCents(paidRows.reduce((sum, entry) => sum + entry.quantity * entry.unit_price_cents, 0)),
        detail: "Revenue from paid or fulfilled merch orders.",
      },
      {
        label: "Customers reached",
        value: String(uniqueCustomers.size),
        detail: "Unique buyers across completed merch orders.",
      },
    ],
    interactions: merchOrderItems.slice(0, 12).map((entry) => {
      const item = merchItems.find((product) => product.id === entry.item_id);
      const order = orderMap.get(entry.order_id);
      const metadata = (order?.metadata ?? {}) as Record<string, unknown>;
      const customer = getCustomerMetadata(metadata);
      return {
        id: entry.id,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        itemName: item?.title ?? "Unknown item",
        itemIdentifier: entry.item_id,
        orderReference: order?.payment_reference ?? order?.id ?? entry.order_id,
        status: order?.status ?? "pending",
        amount: formatRandFromCents(entry.quantity * entry.unit_price_cents),
        createdAtLabel: formatDateTimeLabel(order?.created_at ?? entry.created_at),
        quantity: entry.quantity,
        context: "Merch purchase",
      } satisfies CustomerInteraction;
    }),
  };
}

export async function getOrderAdminInsights(): Promise<{ stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return buildPreviewOrderInsights();
  }

  const [orderCountsResult, paidCountsResult, pendingCountsResult, ordersResult] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("orders")
      .select("id, status, total_cents, payment_reference, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (orderCountsResult.error || paidCountsResult.error || pendingCountsResult.error || ordersResult.error) {
    return buildPreviewOrderInsights();
  }

  const ordersData = ordersResult.data ?? [];
  const orderIds = ordersData.map((order) => order.id);

  const [orderItemsResult, ticketOrdersResult] = await Promise.all([
    orderIds.length
      ? supabase.from("order_items").select("id, order_id, item_id, quantity, unit_price_cents").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    orderIds.length
      ? supabase.from("ticket_orders").select("id, order_id, ticket_id, amount_cents").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (orderItemsResult.error || ticketOrdersResult.error) {
    return buildPreviewOrderInsights();
  }

  const itemIds = [...new Set((orderItemsResult.data ?? []).map((entry) => entry.item_id))];
  const ticketIds = [...new Set((ticketOrdersResult.data ?? []).map((entry) => entry.ticket_id))];

  const [itemsResult, ticketsResult] = await Promise.all([
    itemIds.length
      ? supabase.from("items").select("id, title").in("id", itemIds)
      : Promise.resolve({ data: [], error: null }),
    ticketIds.length
      ? supabase.from("tickets").select("id, reference, event_id").in("id", ticketIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (itemsResult.error || ticketsResult.error) {
    return buildPreviewOrderInsights();
  }

  const eventIds = [...new Set((ticketsResult.data ?? []).map((ticket) => ticket.event_id))];
  const { data: eventsData, error: eventsError } = eventIds.length
    ? await supabase.from("events").select("id, title").in("id", eventIds)
    : { data: [], error: null };

  if (eventsError) {
    return buildPreviewOrderInsights();
  }

  const itemMap = new Map((itemsResult.data ?? []).map((item) => [item.id, item]));
  const ticketMap = new Map((ticketsResult.data ?? []).map((ticket) => [ticket.id, ticket]));
  const eventMap = new Map((eventsData ?? []).map((event) => [event.id, event]));

  const interactions: CustomerInteraction[] = [];

  for (const order of ordersData) {
    const metadata = (order.metadata ?? {}) as Record<string, unknown>;
    const customer = getCustomerMetadata(metadata);
    const orderReference = order.payment_reference ?? order.id;
    const orderLines = (orderItemsResult.data ?? []).filter((entry) => entry.order_id === order.id);
    const ticketLines = (ticketOrdersResult.data ?? []).filter((entry) => entry.order_id === order.id);

    for (const line of orderLines) {
      const item = itemMap.get(line.item_id);
      interactions.push({
        id: line.id,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        itemName: item?.title ?? "Unknown item",
        itemIdentifier: line.item_id,
        orderReference,
        status: order.status,
        amount: formatRandFromCents(line.quantity * line.unit_price_cents),
        createdAtLabel: formatDateTimeLabel(order.created_at),
        quantity: line.quantity,
        context: "store",
      });
    }

    for (const line of ticketLines) {
      const ticket = ticketMap.get(line.ticket_id);
      const event = ticket ? eventMap.get(ticket.event_id) : null;
      interactions.push({
        id: line.id,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        itemName: event?.title ?? "Unknown event",
        itemIdentifier: ticket?.reference ?? line.ticket_id,
        orderReference,
        status: order.status,
        amount: formatRandFromCents(line.amount_cents),
        createdAtLabel: formatDateTimeLabel(order.created_at),
        quantity: 1,
        context: "ticket",
      });
    }

    if (!orderLines.length && !ticketLines.length) {
      interactions.push({
        id: order.id,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        itemName: String(metadata.kind ?? "Order"),
        itemIdentifier: order.id,
        orderReference,
        status: order.status,
        amount: formatRandFromCents(order.total_cents),
        createdAtLabel: formatDateTimeLabel(order.created_at),
        quantity: null,
        context: "unlinked",
      });
    }
  }

  const grossSalesCents = ordersData
    .filter((order) => order.status === "paid" || order.status === "fulfilled")
    .reduce((sum, order) => sum + order.total_cents, 0);

  return {
    source: "supabase",
    stats: [
      {
        label: "Total orders",
        value: String(orderCountsResult.count ?? 0),
        detail: "All orders currently captured by the platform.",
      },
      {
        label: "Paid orders",
        value: String(paidCountsResult.count ?? 0),
        detail: "Orders with successful payment completion.",
      },
      {
        label: "Pending orders",
        value: String(pendingCountsResult.count ?? 0),
        detail: "Orders still waiting on payment or resolution.",
      },
      {
        label: "Gross sales",
        value: formatRandFromCents(grossSalesCents),
        detail: "Revenue across the latest paid and fulfilled orders.",
      },
    ],
    interactions,
  };
}

export async function getTicketAdminInsights(): Promise<{ stats: AdminStat[]; interactions: CustomerInteraction[]; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return buildPreviewTicketInsights();
  }

  const [ticketsResult, ticketOrdersResult, eventsResult] = await Promise.all([
    supabase
      .from("tickets")
      .select("id, reference, event_id, attendee_name, attendee_email, status, audience_category, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("ticket_orders").select("ticket_id, order_id, amount_cents"),
    supabase.from("events").select("id, title"),
  ]);

  if (ticketsResult.error || ticketOrdersResult.error || eventsResult.error) {
    return buildPreviewTicketInsights();
  }

  const ticketOrdersMap = new Map((ticketOrdersResult.data ?? []).map((entry) => [entry.ticket_id, entry]));
  const eventMap = new Map((eventsResult.data ?? []).map((event) => [event.id, event]));
  const soldCount = ticketOrdersResult.data?.length ?? 0;
  const validCount = (ticketsResult.data ?? []).filter((ticket) => ticket.status === "valid").length;
  const checkedInCount = (ticketsResult.data ?? []).filter((ticket) => ticket.status === "used").length;
  const revenueCents = (ticketOrdersResult.data ?? []).reduce((sum, entry) => sum + entry.amount_cents, 0);

  return {
    source: "supabase",
    stats: [
      {
        label: "Tickets sold",
        value: String(soldCount),
        detail: "Issued tickets linked to customer orders.",
      },
      {
        label: "Valid tickets",
        value: String(validCount),
        detail: "Tickets that can still be scanned for entry.",
      },
      {
        label: "Checked in",
        value: String(checkedInCount),
        detail: "Tickets already consumed by the validation flow.",
      },
      {
        label: "Ticket revenue",
        value: formatRandFromCents(revenueCents),
        detail: "Revenue linked to ticket purchases.",
      },
    ],
    interactions: (ticketsResult.data ?? []).map((ticket) => {
      const orderLink = ticketOrdersMap.get(ticket.id);
      const event = eventMap.get(ticket.event_id);
      return {
        id: ticket.id,
        customerName: ticket.attendee_name ?? "Unknown attendee",
        customerEmail: ticket.attendee_email ?? "No email provided",
        itemName: event?.title ?? "Unknown event",
        itemIdentifier: ticket.reference,
        orderReference: orderLink?.order_id ?? "No order linked",
        status: ticket.status,
        amount: formatRandFromCents(orderLink?.amount_cents ?? 0),
        createdAtLabel: formatDateTimeLabel(ticket.created_at),
        context: `${ticket.audience_category} ticket`,
      } satisfies CustomerInteraction;
    }),
  };
}

export async function getHomeHero(): Promise<{ item: HomeHero; source: DataSource }> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { item: homeHero, source: "preview" };
  }

  const { data, error } = await supabase
    .from("homepage_hero")
    .select(
      "id, eyebrow, title, description, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, media_path, media_kind, media_eyebrow, media_title, metric_one_value, metric_one_label, metric_two_value, metric_two_label, metric_three_value, metric_three_label",
    )
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    return { item: homeHero, source: "preview" };
  }

  return {
    source: "supabase",
    item: {
      id: data.id,
      eyebrow: data.eyebrow,
      title: data.title,
      description: data.description,
      primaryCtaLabel: data.primary_cta_label,
      primaryCtaHref: data.primary_cta_href,
      secondaryCtaLabel: data.secondary_cta_label,
      secondaryCtaHref: data.secondary_cta_href,
      mediaPath: data.media_path,
      mediaUrl: data.media_path ? getAdminAssetPublicUrl(supabase, data.media_path) : null,
      mediaKind: data.media_kind,
      mediaEyebrow: data.media_eyebrow,
      mediaTitle: data.media_title,
      metricOneValue: data.metric_one_value,
      metricOneLabel: data.metric_one_label,
      metricTwoValue: data.metric_two_value,
      metricTwoLabel: data.metric_two_label,
      metricThreeValue: data.metric_three_value,
      metricThreeLabel: data.metric_three_label,
    },
  };
}