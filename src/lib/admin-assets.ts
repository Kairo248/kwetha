import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const ADMIN_ASSETS_BUCKET = env.adminAssetsBucket || "platform-assets";

export function buildSlug(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `${normalized || fallback}-${Date.now().toString(36)}`;
}

function sanitizeFileName(fileName: string) {
  const extensionIndex = fileName.lastIndexOf(".");
  const rawBase = extensionIndex >= 0 ? fileName.slice(0, extensionIndex) : fileName;
  const rawExtension = extensionIndex >= 0 ? fileName.slice(extensionIndex).toLowerCase() : "";

  const base = rawBase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${base || "asset"}${rawExtension}`;
}

export async function ensureAdminAssetsBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  const exists = buckets?.some((bucket) => bucket.name === ADMIN_ASSETS_BUCKET);

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(ADMIN_ASSETS_BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm", "video/quicktime"],
    });

    if (createError) {
      throw new Error(createError.message);
    }
  }
}

export function buildAdminAssetPath(section: "events" | "merch" | "content" | "brands" | "hero", fileName: string) {
  const safeFileName = sanitizeFileName(fileName);
  return `${section}/${new Date().toISOString().slice(0, 10)}/${Date.now().toString(36)}-${safeFileName}`;
}

export function getAdminAssetPublicUrl(supabase: SupabaseClient, assetPath?: string | null) {
  if (!assetPath) {
    return null;
  }

  const { data } = supabase.storage.from(ADMIN_ASSETS_BUCKET).getPublicUrl(assetPath);
  return data.publicUrl;
}

export async function removeAdminAsset(supabase: SupabaseClient, assetPath?: string | null) {
  if (!assetPath) {
    return;
  }

  const { error } = await supabase.storage.from(ADMIN_ASSETS_BUCKET).remove([assetPath]);

  if (error) {
    throw new Error(error.message);
  }
}