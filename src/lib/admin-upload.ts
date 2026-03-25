export async function uploadAdminAsset(file: File, section: "events" | "merch" | "content" | "brands" | "hero") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", section);

  const response = await fetch("/api/admin/assets", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; path?: string; publicUrl?: string }
    | null;

  if (!response.ok || !payload?.path) {
    throw new Error(payload?.message ?? "Image upload failed.");
  }

  return {
    path: payload.path,
    publicUrl: payload.publicUrl ?? null,
  };
}