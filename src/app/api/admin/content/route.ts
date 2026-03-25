import { NextResponse } from "next/server";
import { buildSlug } from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { adminContentSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminContentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("content")
    .insert({
      slug: buildSlug(values.title, "content"),
      title: values.title,
      excerpt: values.excerpt,
      category: values.category,
      content_kind: values.kind,
      storage_path: values.assetPath || null,
      featured: values.featured,
      published_at: values.publishNow ? new Date().toISOString() : null,
      metadata: {},
    })
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Unable to create content." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}