import { NextResponse } from "next/server";
import { getAdminAccessState } from "@/lib/auth";
import { adminHomeHeroSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminHomeHeroSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("homepage_hero")
    .upsert(
      {
        id: "default",
        eyebrow: values.eyebrow,
        title: values.title,
        description: values.description,
        primary_cta_label: values.primaryCtaLabel,
        primary_cta_href: values.primaryCtaHref,
        secondary_cta_label: values.secondaryCtaLabel,
        secondary_cta_href: values.secondaryCtaHref,
        media_path: values.mediaPath || null,
        media_kind: values.mediaKind,
        media_eyebrow: values.mediaEyebrow,
        media_title: values.mediaTitle,
        metric_one_value: values.metricOneValue,
        metric_one_label: values.metricOneLabel,
        metric_two_value: values.metricTwoValue,
        metric_two_label: values.metricTwoLabel,
        metric_three_value: values.metricThreeValue,
        metric_three_label: values.metricThreeLabel,
      },
      { onConflict: "id" },
    )
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to save homepage hero." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}