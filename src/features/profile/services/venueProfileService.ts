// Venue business-profile data access — creating and editing the signed-in owner's venues.
import { uploadImage } from "@shared/lib/imageUpload";
import { supabase } from "@shared/lib/supabase";
import type { Database, VenueType } from "@shared/types/database.types";
import type { LocationValue } from "@shared/types/location.types";

export type UpdateVenueInput = {
  name: string;
  venueType: VenueType;
  location: LocationValue;
  pib: string;
  phone: string;
  description?: string;
  logoUri?: string; // local file picked this edit — only set if the owner picked a new one
  coverPhotoUri?: string;
};

// Adding another venue under the same owner (multi-venue) — same fields/upload logic
// as updateVenue, but inserting a new row instead of updating an existing one.
export async function createVenue(ownerId: string, input: UpdateVenueInput) {
  const [logoUrl, coverPhotoUrl] = await Promise.all([
    input.logoUri
      ? uploadImage("venue-logos", ownerId, "logo", input.logoUri)
      : Promise.resolve(null),
    input.coverPhotoUri
      ? uploadImage("venue-logos", ownerId, "cover", input.coverPhotoUri)
      : Promise.resolve(null),
  ]);

  const { data, error } = await supabase
    .from("venues")
    .insert({
      owner_id: ownerId,
      name: input.name,
      venue_type: input.venueType,
      address: input.location.address,
      city: input.location.city,
      lat: input.location.lat,
      lng: input.location.lng,
      pib: input.pib,
      phone: input.phone,
      description: input.description || null,
      logo_url: logoUrl,
      cover_photo_url: coverPhotoUrl,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVenue(
  venueId: string,
  ownerId: string,
  input: UpdateVenueInput,
) {
  const updates: Database["public"]["Tables"]["venues"]["Update"] = {
    name: input.name,
    venue_type: input.venueType,
    address: input.location.address,
    city: input.location.city,
    lat: input.location.lat,
    lng: input.location.lng,
    pib: input.pib,
    phone: input.phone,
    description: input.description || null,
  };

  if (input.logoUri) {
    updates.logo_url = await uploadImage("venue-logos", ownerId, "logo", input.logoUri);
  }
  if (input.coverPhotoUri) {
    updates.cover_photo_url = await uploadImage(
      "venue-logos",
      ownerId,
      "cover",
      input.coverPhotoUri,
    );
  }

  const { error } = await supabase.from("venues").update(updates).eq("id", venueId);
  if (error) throw error;
}
