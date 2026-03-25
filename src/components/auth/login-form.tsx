"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "Enter your name.").optional().or(z.literal("")),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

type SignInInput = z.infer<typeof signInSchema>;
type SignUpInput = z.infer<typeof signUpSchema>;
type AuthMode = "sign-in" | "sign-up";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/account";
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const schema = useMemo(() => (mode === "sign-in" ? signInSchema : signUpSchema), [mode]);
  const form = useForm<SignInInput | SignUpInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const getFriendlyErrorMessage = (message: string) => {
    if (message.includes("Email not confirmed")) {
      return "Your account exists, but your email is not verified yet. Check your inbox for the confirmation email.";
    }

    if (message.includes("Error sending confirmation email")) {
      return "Supabase could not send the signup verification email. Configure Auth email delivery in Supabase, or use a team-authorized address while the project is still on the default SMTP service.";
    }

    if (
      message.includes("already been registered") ||
      message.includes("User already registered") ||
      message.includes("user_already_exists")
    ) {
      return "That email address already has an account. Sign in instead, or reset the password if needed.";
    }

    if (
      message.includes("Password should be at least") ||
      message.includes("password is too weak") ||
      message.includes("weak_password")
    ) {
      return "Use a stronger password that meets Supabase's password requirements.";
    }

    if (message.includes("signup is disabled") || message.includes("Signups not allowed")) {
      return "Email signups are disabled in Supabase Auth. Enable the Email provider before creating accounts.";
    }

    return message;
  };

  const onSubmit = async (values: SignInInput | SignUpInput) => {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    try {
      setIsSubmitting(true);

      if (mode === "sign-in") {
        const signInValues = values as SignInInput;
        const { error } = await supabase.auth.signInWithPassword({
          email: signInValues.email,
          password: signInValues.password,
        });

        if (error) {
          throw error;
        }

        const redirectResponse = await fetch("/api/auth/post-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nextPath }),
        });

        const redirectResult = (await redirectResponse.json().catch(() => null)) as
          | { redirectPath?: string; error?: string }
          | null;

        if (!redirectResponse.ok) {
          throw new Error(redirectResult?.error ?? "Unable to resolve your post-login destination.");
        }

        window.location.assign(redirectResult?.redirectPath ?? nextPath);
        return;
      }

      const signUpValues = values as SignUpInput;
      const { error } = await supabase.auth.signUp({
        email: signUpValues.email,
        password: signUpValues.password,
        options: {
          emailRedirectTo: redirectTo,
          data: signUpValues.fullName ? { full_name: signUpValues.fullName } : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setVerificationEmail(signUpValues.email);
      toast.success("Account created", {
        description: "Check your email to verify your account before signing in.",
      });
      setMode("sign-in");
      form.reset({
        fullName: signUpValues.fullName ?? "",
        email: signUpValues.email,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mode === "sign-in"
            ? "Unable to sign in with email and password."
            : "Unable to create your account.";

      toast.error(mode === "sign-in" ? "Sign-in failed" : "Signup failed", {
        description: getFriendlyErrorMessage(message),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel =
    mode === "sign-in"
      ? isSubmitting
        ? "Signing in..."
        : "Sign in with password"
      : isSubmitting
        ? "Creating account..."
        : "Create account";

  return (
    <form className="mt-8 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-card-border p-1">
        <Button
          type="button"
          variant={mode === "sign-in" ? "primary" : "ghost"}
          onClick={() => {
            setMode("sign-in");
            setVerificationEmail(null);
            form.clearErrors();
          }}
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant={mode === "sign-up" ? "primary" : "ghost"}
          onClick={() => {
            setMode("sign-up");
            setVerificationEmail(null);
            form.clearErrors();
          }}
        >
          Create account
        </Button>
      </div>

      {mode === "sign-up" ? (
        <Input label="Full name" placeholder="Your name" {...form.register("fullName")} />
      ) : null}

      <Input label="Email address" type="email" placeholder="you@example.com" {...form.register("email")} />
      <Input label="Password" type="password" placeholder="Minimum 8 characters" {...form.register("password")} />

      {mode === "sign-up" ? (
        <Input label="Confirm password" type="password" placeholder="Repeat your password" {...form.register("confirmPassword")} />
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>

      {verificationEmail ? (
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-50/70 p-4 text-sm leading-7 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-100">
          Verification email sent to <strong>{verificationEmail}</strong>. Open that email,
          confirm the account, then come back and sign in with your password.
        </div>
      ) : null}

      <p className="text-sm leading-7 text-muted">
        {mode === "sign-in"
          ? "Sign in does not send an email. Verification email is only sent when you create a new account. Admin access is still controlled by the profile role in Supabase."
          : "New customer accounts require email verification before the first sign-in. Create admins the same way, then change their profile role to admin in Supabase."}
      </p>
    </form>
  );
}