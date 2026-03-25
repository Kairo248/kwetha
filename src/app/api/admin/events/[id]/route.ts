import { NextResponse } from "next/server";
import { getAdminAccessState } from "@/lib/auth";
import { adminEventSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { removeAdminAsset } from "@/lib/admin-assets";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = adminEventSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const { data: existing } = await supabase
    .from("events")
    .select("banner_image_path")
    .eq("id", id)
    .maybeSingle();

  const values = parsed.data;
  const { data, error } = await supabase
    .from("events")
    .update({
      title: values.title,
      summary: values.summary,
      venue: values.venue,
      starts_at: new Date(values.startsAt).toISOString(),
      capacity: values.capacity,
      youth_quota: values.youthQuota,
      senior_quota: values.seniorQuota,
      ticket_price_cents: Math.round(values.ticketPrice * 100),
      published: values.published,
      banner_image_path: values.bannerImagePath ?? null,
    })
    .eq("id", id)
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to update event." }, { status: 500 });
  }

  if (existing?.banner_image_path && existing.banner_image_path !== values.bannerImagePath) {
    await removeAdminAsset(supabase, existing.banner_image_path).catch(() => undefined);
  }

  return NextResponse.json({ item: data, message: "Event updated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const { data: existing } = await supabase
    .from("events")
    .select("banner_image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (existing?.banner_image_path) {
    await removeAdminAsset(supabase, existing.banner_image_path).catch(() => undefined);
  }

  return NextResponse.json({ message: "Event deleted." });
}