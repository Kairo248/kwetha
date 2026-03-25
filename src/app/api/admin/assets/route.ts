import { NextResponse } from "next/server";
import {
  ADMIN_ASSETS_BUCKET,
  buildAdminAssetPath,
  ensureAdminAssetsBucket,
  getAdminAssetPublicUrl,
} from "@/lib/admin-assets";
import { getAdminAccessState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await getAdminAccessState();

  if (access.mode !== "granted" && access.mode !== "preview") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin client is not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const sectionValue = formData.get("section");
  const section =
    sectionValue === "events" ||
    sectionValue === "merch" ||
    sectionValue === "content" ||
    sectionValue === "brands" ||
    sectionValue === "hero"
      ? sectionValue
      : null;

  if (!(file instanceof File) || !section) {
    return NextResponse.json({ message: "Provide an image file and section." }, { status: 400 });
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return NextResponse.json({ message: "Only image and video uploads are supported." }, { status: 400 });
  }

  await ensureAdminAssetsBucket(supabase);

  const assetPath = buildAdminAssetPath(section, file.name);
  const fileBytes = await file.arrayBuffer();
  const { error } = await supabase.storage.from(ADMIN_ASSETS_BUCKET).upload(assetPath, fileBytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    path: assetPath,
    publicUrl: getAdminAssetPublicUrl(supabase, assetPath),
  });
}