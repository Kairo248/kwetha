import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNavbar } from "@/components/layout/admin-navbar";
import { requireAdminAccess } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await requireAdminAccess();

  return (
    <div>
      <style>{`
        [data-public-shell="header"],
        [data-public-shell="footer"] {
          display: none;
        }
      `}</style>
      <AdminNavbar
        fullName={access.mode === "granted" ? access.profile?.fullName : null}
        isPreview={access.mode === "preview"}
      />
      {access.mode === "preview" ? (
        <div className="border-b border-amber-300/40 bg-amber-100/70 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/25 dark:text-amber-100">
          Preview mode: admin pages are visible because Supabase Auth is not configured yet.
          Connect Supabase and assign the <strong>admin</strong> role in profiles to enforce protection.
        </div>
      ) : access.profile ? (
        <div className="border-b border-card-border/60 px-4 py-3 text-sm text-muted md:px-8">
          Signed in as {access.profile.fullName ?? "Admin"}. <Link href="/">Back to public site</Link>
        </div>
      ) : null}
      {children}
    </div>
  );
}