// Auth service — email/password sign-in/up via Supabase. Role goes in signup metadata
// so the DB trigger (handle_new_user) creates the matching profile row.
import { supabase } from "@shared/lib/supabase";
import type { VenueType } from "@shared/types/database.types";

export type WorkerSignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
};

export type VenueSignUpInput = {
  email: string;
  password: string;
  fullName: string; // contact person
  phone?: string;
  city?: string;
  venueName: string;
  venueType: VenueType;
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
        phone: input.phone ?? null,
      },
    },
  });
  if (error) throw error;

  // Fill in city on the auto-created profile once we have a session.
  if (data.session && input.city) {
    await supabase.from("profiles").update({ city: input.city }).eq("id", data.user!.id);
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
        phone: input.phone ?? null,
      },
    },
  });
  if (error) throw error;

  // Create the venue record (requires a session — MVP assumes email confirmation is off).
  if (data.session && data.user) {
    if (input.city) {
      await supabase.from("profiles").update({ city: input.city }).eq("id", data.user.id);
    }
    const { error: venueError } = await supabase.from("venues").insert({
      owner_id: data.user.id,
      name: input.venueName,
      venue_type: input.venueType,
      city: input.city ?? null,
    });
    if (venueError) throw venueError;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
