// Supabase schema types — hand-authored to match supabase/migrations.
// Regenerate later with `supabase gen types typescript` once the project exists.

export type UserRole = "worker" | "venue";
export type VenueType =
  | "cafe"
  | "bar"
  | "pub"
  | "club"
  | "kafana"
  | "restaurant"
  | "fast_food"
  | "bakery";
export type WorkerRole =
  | "waiter"
  | "bartender"
  | "cocktail_master"
  | "barista"
  | "cook"
  | "host"
  | "kitchen_helper";
export type ExperienceLevel = "none" | "1_3_years" | "3plus_years";
export type EmploymentType = "fill_in" | "part_time" | "full_time";
export type PayPeriod = "hour" | "shift" | "month";
export type ListingStatus = "open" | "closed" | "filled";
export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          worker_roles: WorkerRole[];
          experience_level: ExperienceLevel | null;
          skills: string[];
          is_available: boolean;
          rating_avg: number | null;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          worker_roles?: WorkerRole[];
          experience_level?: ExperienceLevel | null;
          skills?: string[];
          is_available?: boolean;
          rating_avg?: number | null;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          venue_type: VenueType;
          description: string | null;
          address: string | null;
          city: string | null;
          pib: string | null;
          phone: string | null;
          lat: number | null;
          lng: number | null;
          logo_url: string | null;
          cover_photo_url: string | null;
          rating_avg: number | null;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          venue_type: VenueType;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          pib?: string | null;
          phone?: string | null;
          lat?: number | null;
          lng?: number | null;
          logo_url?: string | null;
          cover_photo_url?: string | null;
          rating_avg?: number | null;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["venues"]["Insert"]>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          venue_id: string;
          title: string;
          role_needed: WorkerRole;
          employment_type: EmploymentType;
          description: string | null;
          pay_amount: number | null;
          pay_period: PayPeriod;
          currency: string;
          start_hour: number | null;
          end_hour: number | null;
          is_urgent: boolean;
          status: ListingStatus;
          requirements: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          title: string;
          role_needed: WorkerRole;
          employment_type: EmploymentType;
          description?: string | null;
          pay_amount?: number | null;
          pay_period?: PayPeriod;
          currency?: string;
          start_hour?: number | null;
          end_hour?: number | null;
          is_urgent?: boolean;
          status?: ListingStatus;
          requirements?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          listing_id: string;
          worker_id: string;
          status: ApplicationStatus;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          worker_id: string;
          status?: ApplicationStatus;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [];
      };
      saved_listings: {
        Row: {
          id: string;
          worker_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_listings"]["Insert"]>;
        Relationships: [];
      };
      listing_views: {
        Row: {
          id: string;
          listing_id: string;
          viewer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          viewer_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_views"]["Insert"]>;
        Relationships: [];
      };
      worker_ratings: {
        Row: {
          id: string;
          worker_id: string;
          rater_id: string;
          productivity: number;
          reliability: number;
          quality: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          rater_id: string;
          productivity: number;
          reliability: number;
          quality: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["worker_ratings"]["Insert"]>;
        Relationships: [];
      };
      venue_ratings: {
        Row: {
          id: string;
          venue_id: string;
          rater_id: string;
          conditions: number;
          atmosphere: number;
          benefits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          rater_id: string;
          conditions: number;
          atmosphere: number;
          benefits: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["venue_ratings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Enums: {
      user_role: UserRole;
      venue_type: VenueType;
      worker_role: WorkerRole;
      employment_type: EmploymentType;
      pay_period: PayPeriod;
      listing_status: ListingStatus;
      application_status: ApplicationStatus;
    };
  };
}

// Convenience row aliases used across features.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Venue = Database["public"]["Tables"]["venues"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type SavedListing =
  Database["public"]["Tables"]["saved_listings"]["Row"];
export type ListingView = Database["public"]["Tables"]["listing_views"]["Row"];
export type WorkerRating =
  Database["public"]["Tables"]["worker_ratings"]["Row"];
export type VenueRating = Database["public"]["Tables"]["venue_ratings"]["Row"];
