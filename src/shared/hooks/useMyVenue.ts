// Fetches the signed-in venue owner's venue record. Shared (home + profile consume it).
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import { supabase } from "@shared/lib/supabase";
import type { Venue } from "@shared/types/database.types";

async function fetchMyVenue(ownerId: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export function useMyVenue() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myVenue(user?.id ?? "anon"),
    queryFn: () => fetchMyVenue(user!.id),
    enabled: !!user,
  });
  return { venue: query.data ?? null, isLoading: query.isLoading };
}
