import { NextResponse } from "next/server";
import { buildSlug } from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { adminBrandSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminBrandSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("brands")
    .insert({
      slug: buildSlug(values.name, "brand"),
      name: values.name,
      description: values.description,
      logo_path: values.logoPath || null,
      website_url: values.websiteUrl || null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    })
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to create brand." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}