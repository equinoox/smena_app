// Narrow, single-purpose location updates — used by the topbar "change location" flow
// (EditableLocationRow), which only ever touches address/city/lat/lng, unlike the full
// venue-edit form's updateVenue (features/profile) which writes the whole business
// profile at once. Lives in shared because both the home and saved features consume it.
import { supabase } from "@shared/lib/supabase";
import type { LocationValue } from "@shared/types/location.types";

export async function updateWorkerLocation(userId: string, location: LocationValue) {
  const { error } = await supabase
    .from("profiles")
    .update({
      address: location.address,
      city: location.city,
      lat: location.lat,
      lng: location.lng,
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function updateVenueLocation(venueId: string, location: LocationValue) {
  const { error } = await supabase
    .from("venues")
    .update({
      address: location.address,
      city: location.city,
      lat: location.lat,
      lng: location.lng,
    })
    .eq("id", venueId);
  if (error) throw error;
}
