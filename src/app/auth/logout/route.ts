import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });

  if (env.supabaseUrl && env.supabaseAnonKey) {
    const requestCookies = request.headers.get("cookie") ?? "";
    const cookieMap = requestCookies
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        return {
          name: cookie.slice(0, separatorIndex),
          value: cookie.slice(separatorIndex + 1),
        };
      });

    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieMap;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.signOut();
  }

  return response;
}