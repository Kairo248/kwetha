import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, ProfileSummary } from "@/types/domain";

type ViewerState = {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
  } | null;
  profile: ProfileSummary | null;
};

type AdminAccessState =
  | { mode: "preview" }
  | { mode: "redirect" }
  | { mode: "forbidden"; profile: ProfileSummary | null }
  | { mode: "granted"; profile: ProfileSummary | null };

export async function getAdminAccessState(): Promise<AdminAccessState> {
  if (!isSupabaseConfigured) {
    return { mode: "preview" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { mode: "redirect" };
  }

  const adminSupabase = createSupabaseAdminClient();
  const profileQueryClient = adminSupabase ?? supabase;
  const { data: profile } = await profileQueryClient
    .from("profiles")
    .select("id, user_id, full_name, role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  const normalizedProfile: ProfileSummary | null = profile
    ? {
        id: profile.id,
        userId: profile.user_id,
        fullName: profile.full_name,
        role: profile.role as AppRole,
      }
    : null;

  if (normalizedProfile?.role !== "admin") {
    return { mode: "forbidden", profile: normalizedProfile };
  }

  return { mode: "granted", profile: normalizedProfile };
}

export async function requireAdminAccess() {
  const state = await getAdminAccessState();

  if (state.mode === "redirect") {
    redirect("/login?next=/admin");
  }

  if (state.mode === "forbidden") {
    redirect("/login?next=/admin&reason=admin");
  }

  return state;
}

export async function getOptionalSupabaseUserId() {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function syncProfileFromSession(input?: {
  userId?: string;
  email?: string | null;
  fullName?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !input?.userId) {
    return null;
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, role")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingProfile) {
    return {
      id: existingProfile.id,
      userId: existingProfile.user_id,
      fullName: existingProfile.full_name,
      role: existingProfile.role as AppRole,
    } satisfies ProfileSummary;
  }

  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert({
      user_id: input.userId,
      full_name: input.fullName ?? input.email ?? "Customer",
      role: "customer",
    })
    .select("id, user_id, full_name, role")
    .single();

  if (error || !createdProfile) {
    return null;
  }

  return {
    id: createdProfile.id,
    userId: createdProfile.user_id,
    fullName: createdProfile.full_name,
    role: createdProfile.role as AppRole,
  } satisfies ProfileSummary;
}

export async function getViewerState(): Promise<ViewerState> {
  if (!isSupabaseConfigured) {
    return { user: null, profile: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return { user: null, profile: null };
    }

    const fullName =
      typeof data.user.user_metadata?.full_name === "string"
        ? data.user.user_metadata.full_name
        : null;

    const profile = await syncProfileFromSession({
      userId: data.user.id,
      email: data.user.email ?? null,
      fullName,
    });

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        fullName,
      },
      profile,
    };
  } catch {
    return { user: null, profile: null };
  }
}

export async function requireAuthenticatedUser(nextPath = "/account") {
  const viewer = await getViewerState();

  if (!viewer.user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return viewer;
}