import { NextResponse } from "next/server";
import { removeAdminAsset } from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    .from("content")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ message: "Content item not found." }, { status: 404 });
  }

  const { error } = await supabase.from("content").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (existing.storage_path) {
    await removeAdminAsset(supabase, existing.storage_path).catch(() => undefined);
  }

  return NextResponse.json({ message: "Content item deleted." });
}
