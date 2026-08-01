// Venue business-profile data access — editing the signed-in owner's venue record.
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
