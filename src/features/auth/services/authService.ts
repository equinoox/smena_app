// Auth service — email/password sign-in/up via Supabase. Role goes in signup metadata
// so the DB trigger (handle_new_user) creates the matching profile row.
import { supabase } from "@shared/lib/supabase";
import type { ExperienceLevel, VenueType } from "@shared/types/database.types";

export type WorkerSignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  experienceLevel: ExperienceLevel;
};

export type VenueSignUpInput = {
  email: string;
  password: string;
  fullName: string; // contact person
  venueName: string;
  venueType: VenueType;
  address: string;
  pib: string;
  phone: string; // venue's own public contact number, not the owner's
  description?: string;
  logoUri?: string; // local file picked before the account existed; uploaded after signUp
};

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWorker(input: WorkerSignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        role: "worker",
        full_name: input.fullName,
        phone: input.phone,
      },
    },
  });
  if (error) throw error;

  // Fill in the rest of the profile once we have a session (auto-created by the trigger).
  if (data.session && data.user) {
    await supabase
      .from("profiles")
      .update({
        city: input.city,
        experience_level: input.experienceLevel,
      })
      .eq("id", data.user.id);
  }
  return data;
}

export async function signUpVenue(input: VenueSignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        role: "venue",
        full_name: input.fullName,
      },
    },
  });
  if (error) throw error;

  // Create the venue record (requires a session — MVP assumes email confirmation is off).
  if (data.session && data.user) {
    const logoUrl = input.logoUri
      ? await uploadVenueLogo(data.user.id, input.logoUri)
      : null;

    const { error: venueError } = await supabase.from("venues").insert({
      owner_id: data.user.id,
      name: input.venueName,
      venue_type: input.venueType,
      address: input.address,
      pib: input.pib,
      phone: input.phone,
      description: input.description ?? null,
      logo_url: logoUrl,
    });
    if (venueError) throw venueError;
  }
  return data;
}

// Uploads the locally-picked logo image to the venue-logos bucket. Runs after signUp
// (not at picker time) since the storage path needs the real auth uid, which only
// exists once the account has been created.
async function uploadVenueLogo(ownerId: string, localUri: string) {
  const ext = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from("venue-logos")
    .upload(`${ownerId}/logo.${ext}`, arrayBuffer, {
      contentType: `image/${ext}`,
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage
    .from("venue-logos")
    .getPublicUrl(`${ownerId}/logo.${ext}`);
  return data.publicUrl;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
