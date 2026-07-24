// useUserRole — reads the signed-in user's profile (and role) from Supabase via React Query.
// Role-sensitive screens branch on this to render worker vs venue views.
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import { supabase } from "@shared/lib/supabase";
import type { Profile, UserRole } from "@shared/types/database.types";

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export function useUserRole() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.profile(user?.id ?? "anon"),
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  return {
    profile: query.data ?? null,
    role: (query.data?.role ?? null) as UserRole | null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
