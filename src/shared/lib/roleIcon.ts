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
