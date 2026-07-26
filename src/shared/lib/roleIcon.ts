// Maps a worker role to a Phosphor icon (design leads listing cards with a role glyph).
import {
  Coffee,
  CookingPot,
  ForkKnife,
  UsersThree,
  Wine,
} from "phosphor-react-native";
import type { VenueType, WorkerRole } from "@shared/types/database.types";

export const roleIcon: Record<WorkerRole, typeof Coffee> = {
  waiter: ForkKnife,
  bartender: Wine,
  barista: Coffee,
  cook: CookingPot,
  host: UsersThree,
  kitchen_helper: ForkKnife,
};

export const WORKER_ROLES = [
  "waiter",
  "bartender",
  "barista",
  "cook",
  "host",
  "kitchen_helper",
] as const satisfies readonly WorkerRole[];

export const EXPERIENCE_LEVELS = ["none", "1_3_years", "3plus_years"] as const;

export const VENUE_TYPES = [
  "cafe",
  "bar",
  "restaurant",
  "club",
  "bakery",
] as const satisfies readonly VenueType[];
