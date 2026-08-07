// Fetches every venue the signed-in owner runs, and tracks which one is "active" — the
// venue Home/CreateListing default to. The active id is persisted in AsyncStorage via a
// small Zustand store (same hydrate-then-read shape as useOnboardingStatus), so picking a
// venue in "Moji lokali" stays picked across app restarts.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import { supabase } from "@shared/lib/supabase";
import type { Venue } from "@shared/types/database.types";

const KEY = "smena.activeVenueId";

type ActiveVenueStore = {
  activeVenueId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setActiveVenueId: (id: string) => Promise<void>;
};

const useActiveVenueStore = create<ActiveVenueStore>((set, get) => ({
  activeVenueId: null,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const value = await AsyncStorage.getItem(KEY);
    set({ activeVenueId: value, hydrated: true });
  },
  setActiveVenueId: async (id) => {
    await AsyncStorage.setItem(KEY, id);
    set({ activeVenueId: id });
  },
}));

async function fetchMyVenues(ownerId: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useMyVenues() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myVenues(user?.id ?? "anon"),
    queryFn: () => fetchMyVenues(user!.id),
    enabled: !!user,
  });
  return { venues: query.data ?? [], isLoading: query.isLoading };
}

// Resolves to the owner's stored pick, falling back to their first venue when unset or
// when the stored id no longer belongs to them (covers the common single-venue case too).
export function useActiveVenue() {
  const { venues, isLoading } = useMyVenues();
  const activeVenueId = useActiveVenueStore((s) => s.activeVenueId);
  const hydrate = useActiveVenueStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const venue = venues.find((v) => v.id === activeVenueId) ?? venues[0] ?? null;
  return { venue, venues, isLoading };
}

export function useSetActiveVenue() {
  return useActiveVenueStore((s) => s.setActiveVenueId);
}
