"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import { uploadAdminAsset } from "@/lib/admin-upload";
import type { ProductItem } from "@/types/domain";

type MerchOperationsPanelProps = {
  items: ProductItem[];
};

type StatusState = {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
} | null;

export function MerchOperationsPanel({ items }: MerchOperationsPanelProps) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-card-border p-5 text-sm text-muted">
        No merch items found yet. Create one from the form to seed the catalog, upload a product image, and then return here to edit price or inventory.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
      {items.map((item) => (
        <EditableMerchCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function EditableMerchCard({ item }: { item: ProductItem }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(item.price);
  const [inventory, setInventory] = useState(item.inventory);
  const [isActive, setIsActive] = useState(item.isActive ?? true);
  const [imagePath, setImagePath] = useState(item.imagePath ?? "");
  const [imagePreviewUrl, setImagePreviewUrl] = useState(item.imageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const saveItem = async () => {
    setStatus(null);
    setIsSaving(true);

    try {
      let uploadedPath = imagePath;
      let uploadedUrl = imagePreviewUrl;

      if (selectedFile) {
        const uploadedAsset = await uploadAdminAsset(selectedFile, "merch");
        uploadedPath = uploadedAsset.path;
        uploadedUrl = uploadedAsset.publicUrl ?? uploadedUrl;
      }

      const response = await fetch(`/api/admin/merch/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          inventory,
          isActive,
          imagePath: uploadedPath || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not update merch item.");
      }

      setImagePath(uploadedPath);
      setImagePreviewUrl(uploadedUrl || "");
      setSelectedFile(null);
      setStatus({
        tone: "success",
        title: "Merch updated",
        message: `${title} now reflects the latest catalog changes.`,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Update failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async () => {
    const confirmed = window.confirm(`Delete ${item.title}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setStatus(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/merch/${item.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not delete merch item.");
      }

      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Delete failed",
        message: error instanceof Error ? error.message : "Try again shortly.",
      });
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-3xl border border-card-border p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 gap-5">
          {imagePreviewUrl ? (
            <Image src={imagePreviewUrl} alt={title} width={96} height={96} className="h-24 w-24 rounded-3xl object-cover" unoptimized />
          ) : (
            <div className="surface-grid h-24 w-24 rounded-3xl bg-sand/60 dark:bg-sand/15" />
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-accent-strong">
                {item.category}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-card-border px-3 py-2">R {item.price.toFixed(2)}</span>
              <span className="rounded-full border border-card-border px-3 py-2">{item.inventory} in stock</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? "Close editor" : "Edit item"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="border-rose-300 text-rose-700 hover:border-rose-500 hover:text-rose-800 dark:text-rose-200"
            onClick={deleteItem}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {status ? <FormStatus className="mt-6" tone={status.tone} title={status.title} message={status.message} /> : null}

      {isEditing ? (
        <div className="mt-8 grid gap-4 border-t border-card-border/60 pt-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Product title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <Input label="Price (R)" type="number" min={0} step="0.01" value={String(price)} onChange={(event) => setPrice(Number(event.target.value))} />
          <Input label="Inventory" type="number" min={0} value={String(inventory)} onChange={(event) => setInventory(Number(event.target.value))} />
          <div className="md:col-span-2">
            <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Product image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                if (file) {
                  setImagePreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-card-border bg-canvas/40 px-4 py-3 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 accent-accent" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Keep this item active in the public store
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={saveItem} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
            <p className="text-sm text-muted">Upload a new product image only when you want to replace the current visual.</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}