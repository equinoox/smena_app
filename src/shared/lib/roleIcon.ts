// Maps a worker role to a Phosphor icon (design leads listing cards with a role glyph).
import {
  Champagne,
  Coffee,
  CookingPot,
  ForkKnife,
  UsersThree,
  Wine,
} from "phosphor-react-native";
import type { VenueType, WorkerRole } from "@shared/types/database.types";

// Exhaustive over the DB enum — `kitchen_helper` stays mapped even though it's no
// longer offered in WORKER_ROLES (the picker array), since the enum value itself is
// kept for backward compatibility (see migration 0003).
export const roleIcon: Record<WorkerRole, typeof Coffee> = {
  waiter: ForkKnife,
  bartender: Wine,
  cocktail_master: Champagne,
  barista: Coffee,
  cook: CookingPot,
  host: UsersThree,
  kitchen_helper: ForkKnife,
};

// User-facing selectable positions — order is display order everywhere this is mapped.
export const WORKER_ROLES = [
  "waiter",
  "bartender",
  "cocktail_master",
  "cook",
  "barista",
  "host",
] as const satisfies readonly WorkerRole[];

export const EXPERIENCE_LEVELS = ["none", "1_3_years", "3plus_years"] as const;

export const VENUE_TYPES = [
  "cafe",
  "bar",
  "pub",
  "club",
  "kafana",
  "restaurant",
  "fast_food",
  "bakery",
] as const satisfies readonly VenueType[];
