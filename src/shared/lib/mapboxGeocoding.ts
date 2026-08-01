// Mapbox Geocoding API v6 — forward search (address text -> candidates) and reverse
// (coordinates -> address), scoped to Serbia. Plain fetch, no extra SDK needed.
import { isMapboxConfigured } from "@shared/lib/mapbox";
import { toLatin } from "@shared/lib/cyrillic";
import type { LocationValue } from "@shared/types/location.types";

const BASE_URL = "https://api.mapbox.com/search/geocode/v6";

type GeocodeFeature = {
  properties: {
    full_address?: string;
    name?: string;
    context?: {
      place?: { name?: string };
      locality?: { name?: string };
    };
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
};

type GeocodeResponse = {
  features: GeocodeFeature[];
};

function toLocationValue(feature: GeocodeFeature): LocationValue {
  const [lng, lat] = feature.geometry.coordinates;
  // `name` is the short street-level line (e.g. "Pariske komune 13") — `full_address`
  // bundles in city/postal/country too, which is more than the app ever wants to show.
  const address = feature.properties.name ?? feature.properties.full_address ?? "";
  const city =
    feature.properties.context?.place?.name ??
    feature.properties.context?.locality?.name ??
    null;
  return {
    address: toLatin(address),
    city: city ? toLatin(city) : null,
    lat,
    lng,
  };
}

function accessToken() {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!isMapboxConfigured || !token) {
    throw new Error("Mapbox access token is not configured.");
  }
  return token;
}

export async function forwardGeocode(
  query: string,
  opts?: { proximity?: { lat: number; lng: number } },
): Promise<LocationValue[]> {
  const params = new URLSearchParams({
    q: query,
    access_token: accessToken(),
    country: "rs",
    language: "sr-Latn",
    autocomplete: "true",
    limit: "5",
  });
  if (opts?.proximity) {
    params.set("proximity", `${opts.proximity.lng},${opts.proximity.lat}`);
  }

  const response = await fetch(`${BASE_URL}/forward?${params.toString()}`);
  if (!response.ok) throw new Error("Mapbox forward geocoding request failed.");
  const data = (await response.json()) as GeocodeResponse;
  return data.features.map(toLocationValue);
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<LocationValue | null> {
  const params = new URLSearchParams({
    longitude: String(lng),
    latitude: String(lat),
    access_token: accessToken(),
    country: "rs",
    language: "sr-Latn",
  });

  const response = await fetch(`${BASE_URL}/reverse?${params.toString()}`);
  if (!response.ok) throw new Error("Mapbox reverse geocoding request failed.");
  const data = (await response.json()) as GeocodeResponse;
  const [first] = data.features;
  return first ? toLocationValue(first) : null;
}
