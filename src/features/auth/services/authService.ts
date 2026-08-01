// Auth service — email/password sign-in/up via Supabase. Role goes in signup metadata
// so the DB trigger (handle_new_user) creates the matching profile row.
import { uploadImage } from "@shared/lib/imageUpload";
import { supabase } from "@shared/lib/supabase";
import type {
  ExperienceLevel,
  Profile,
  Venue,
  VenueType,
  WorkerRole,
} from "@shared/types/database.types";
import type { LocationValue } from "@shared/types/location.types";

export type WorkerSignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  location: LocationValue;
  experienceLevel: ExperienceLevel;
  bio?: string;
  skills: string[];
  workerRoles: WorkerRole[];
  avatarUri?: string; // local file picked before the account existed; uploaded after signUp
};

export type VenueSignUpInput = {
  email: string;
  password: string;
  fullName: string; // contact person
  ownerPhone?: string; // contact person's own phone, distinct from the venue's public phone
  venueName: string;
  venueType: VenueType;
  location: LocationValue;
  pib: string;
  phone: string; // venue's own public contact number, not the owner's
  description?: string;
  logoUri?: string; // local file picked before the account existed; uploaded after signUp
  coverPhotoUri?: string;
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
  let profile: Profile | null = null;
  if (data.session && data.user) {
    const avatarUrl = input.avatarUri
      ? await uploadImage("avatars", data.user.id, "avatar", input.avatarUri)
      : null;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({
        address: input.location.address,
        city: input.location.city,
        lat: input.location.lat,
        lng: input.location.lng,
        experience_level: input.experienceLevel,
        bio: input.bio || null,
        skills: input.skills,
        worker_roles: input.workerRoles,
        avatar_url: avatarUrl,
      })
      .eq("id", data.user.id)
      .select()
      .single();
    if (profileError) throw profileError;
    profile = profileData;
  }
  return { ...data, profile };
}

export async function signUpVenue(input: VenueSignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        role: "venue",
        full_name: input.fullName,
        phone: input.ownerPhone || null,
      },
    },
  });
  if (error) throw error;

  // Create the venue record (requires a session — MVP assumes email confirmation is off).
  let venue: Venue | null = null;
  if (data.session && data.user) {
    // Upload logo + cover in parallel — sequentially awaiting each one just doubles
    // the wait when a venue picks both photos at sign-up.
    const [logoUrl, coverPhotoUrl] = await Promise.all([
      input.logoUri
        ? uploadImage("venue-logos", data.user.id, "logo", input.logoUri)
        : Promise.resolve(null),
      input.coverPhotoUri
        ? uploadImage("venue-logos", data.user.id, "cover", input.coverPhotoUri)
        : Promise.resolve(null),
    ]);

    const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .insert({
        owner_id: data.user.id,
        name: input.venueName,
        venue_type: input.venueType,
        address: input.location.address,
        city: input.location.city,
        lat: input.location.lat,
        lng: input.location.lng,
        pib: input.pib,
        phone: input.phone,
        description: input.description ?? null,
        logo_url: logoUrl,
        cover_photo_url: coverPhotoUrl,
      })
      .select()
      .single();
    if (venueError) throw venueError;
    venue = venueData;
  }
  return { ...data, venue };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
