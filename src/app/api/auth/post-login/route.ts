import { NextResponse } from "next/server";
import { syncProfileFromSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PostLoginRequest = {
  nextPath?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PostLoginRequest;
  const requestedPath =
    typeof body.nextPath === "string" && body.nextPath.startsWith("/") ? body.nextPath : "/account";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No active session." }, { status: 401 });
  }

  const profile = await syncProfileFromSession({
    userId: user.id,
    email: user.email ?? null,
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
  });

  const redirectPath =
    profile?.role === "admin"
      ? requestedPath === "/account"
        ? "/admin"
        : requestedPath
      : requestedPath.startsWith("/admin")
        ? "/account"
        : requestedPath;

  return NextResponse.json({ redirectPath });
}