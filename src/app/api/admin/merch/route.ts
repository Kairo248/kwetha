import { NextResponse } from "next/server";
import { buildSlug } from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { adminMerchSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminMerchSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("items")
    .insert({
      slug: buildSlug(values.title, "merch"),
      title: values.title,
      description: values.description,
      image_path: values.imagePath ?? null,
      item_type: "merch",
      price_cents: Math.round(values.price * 100),
      inventory_count: values.inventory,
      is_active: values.isActive,
    })
    .select("id, title, slug")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to create merch item." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}