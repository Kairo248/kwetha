import { NextResponse } from "next/server";
import { buildSlug } from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { adminEventSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminEventSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("events")
    .insert({
      slug: buildSlug(values.title, "event"),
      title: values.title,
      summary: values.summary,
      venue: values.venue,
      starts_at: new Date(values.startsAt).toISOString(),
      banner_image_path: values.bannerImagePath ?? null,
      capacity: values.capacity,
      youth_quota: values.youthQuota,
      senior_quota: values.seniorQuota,
      ticket_price_cents: Math.round(values.ticketPrice * 100),
      published: values.published,
    })
    .select("id, title, slug")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to create event." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}