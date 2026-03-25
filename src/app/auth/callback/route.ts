import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { syncProfileFromSession } from "@/lib/auth";
import { env, isSupabaseConfigured } from "@/lib/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/admin";
  const response = NextResponse.redirect(new URL(nextPath, request.url));

  if (code && isSupabaseConfigured && env.supabaseUrl && env.supabaseAnonKey) {
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      await syncProfileFromSession({
        userId: data.user.id,
        email: data.user.email ?? null,
        fullName:
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name
            : null,
      });
    }
  }

  return response;
}