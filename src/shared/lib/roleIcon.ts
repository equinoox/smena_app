// Maps a worker role to a Phosphor icon (design leads listing cards with a role glyph).
import {
  Coffee,
  CookingPot,
  ForkKnife,
  UsersThree,
  Wine,
} from "phosphor-react-native";
import type { WorkerRole } from "@shared/types/database.types";

export const roleIcon: Record<WorkerRole, typeof Coffee> = {
  waiter: ForkKnife,
  bartender: Wine,
  barista: Coffee,
  cook: CookingPot,
  host: UsersThree,
  kitchen_helper: ForkKnife,
};

export const WORKER_ROLES: WorkerRole[] = [
  "waiter",
  "bartender",
  "barista",
  "cook",
  "host",
  "kitchen_helper",
];

export const EXPERIENCE_LEVELS = ["none", "1_3_years", "3plus_years"] as const;
