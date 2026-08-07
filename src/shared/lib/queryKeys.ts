// Central React Query key factory so caches stay consistent across features.
import type { EmploymentType, WorkerRole } from "@shared/types/database.types";

export type ListingFilters = {
  employmentType?: EmploymentType | "all";
  city?: string;
  roleNeeded?: WorkerRole;
  search?: string;
};

export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  myVenue: (userId: string) => ["venue", "owner", userId] as const,
  listings: (filters: ListingFilters) => ["listings", filters] as const,
  listing: (id: string) => ["listing", id] as const,
  venueListings: (venueId: string) => ["listings", "venue", venueId] as const,
  venueListingsByOwner: (ownerId: string) =>
    ["listings", "venue-owner", ownerId] as const,
  savedListings: (userId: string) => ["saved", userId] as const,
  workerApplications: (userId: string) =>
    ["applications", "worker", userId] as const,
  listingApplications: (listingId: string) =>
    ["applications", "listing", listingId] as const,
  listingApplicationsList: (listingId: string) =>
    ["applications", "listing", listingId, "list"] as const,
  venueStats: (venueId: string) => ["venueStats", venueId] as const,
  listingCounts: (listingIds: string[]) =>
    ["listingCounts", [...listingIds].sort()] as const,
  openListingsCount: () => ["listings", "openCount"] as const,
  listingViews: (listingId: string) => ["views", "listing", listingId] as const,
  availableWorkers: () => ["profiles", "available"] as const,
  allWorkers: () => ["profiles", "all"] as const,
  workerProfile: (id: string) => ["profiles", "worker", id] as const,
  venueProfile: (id: string) => ["venues", "profile", id] as const,
  myWorkerRating: (workerId: string, raterId: string) =>
    ["ratings", "worker", workerId, "mine", raterId] as const,
  myVenueRating: (venueId: string, raterId: string) =>
    ["ratings", "venue", venueId, "mine", raterId] as const,
};
