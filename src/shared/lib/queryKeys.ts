// Central React Query key factory so caches stay consistent across features.
import type { EmploymentType } from "@shared/types/database.types";

export type ListingFilters = {
  employmentType?: EmploymentType | "all";
  city?: string;
};

export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  myVenue: (userId: string) => ["venue", "owner", userId] as const,
  listings: (filters: ListingFilters) => ["listings", filters] as const,
  listing: (id: string) => ["listing", id] as const,
  venueListings: (venueId: string) => ["listings", "venue", venueId] as const,
  savedListings: (userId: string) => ["saved", userId] as const,
  workerApplications: (userId: string) =>
    ["applications", "worker", userId] as const,
  listingApplications: (listingId: string) =>
    ["applications", "listing", listingId] as const,
};
