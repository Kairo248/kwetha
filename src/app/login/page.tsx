import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <section className="glass-panel rounded-4xl p-8 md:p-10">
        <p className="eyebrow mb-4">Account Access</p>
        <h1 className="display-title text-5xl leading-none sm:text-6xl">
          Use passwords for customer and admin accounts.
        </h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          Customers sign up with email and password, then verify their email before
          signing in. Admins use the same password flow, but still require the admin role
          in `profiles` to access protected routes.
        </p>
        {isSupabaseConfigured ? (
          <Suspense fallback={<div className="mt-8 text-sm text-muted">Loading sign-in form...</div>}>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="mt-8 rounded-3xl border border-card-border p-5 text-sm text-muted">
            Supabase environment variables are not configured yet. Once they are added,
            this page will support email/password sign-in and email-verified signup.
          </div>
        )}
      </section>
    </div>
  );
}