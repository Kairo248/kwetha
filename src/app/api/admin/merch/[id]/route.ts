import { NextResponse } from "next/server";
import { removeAdminAsset } from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { adminMerchSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = adminMerchSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const { data: existing } = await supabase
    .from("items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const values = parsed.data;
  const { data, error } = await supabase
    .from("items")
    .update({
      title: values.title,
      description: values.description,
      price_cents: Math.round(values.price * 100),
      inventory_count: values.inventory,
      is_active: values.isActive,
      image_path: values.imagePath ?? null,
    })
    .eq("id", id)
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to update merch item." }, { status: 500 });
  }

  if (existing?.image_path && existing.image_path !== values.imagePath) {
    await removeAdminAsset(supabase, existing.image_path).catch(() => undefined);
  }

  return NextResponse.json({ item: data, message: "Merch item updated." });
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
    .from("items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (existing?.image_path) {
    await removeAdminAsset(supabase, existing.image_path).catch(() => undefined);
  }

  return NextResponse.json({ message: "Merch item deleted." });
}