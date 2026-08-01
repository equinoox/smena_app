// A map-picked location: formatted address + derived city + coordinates, captured
// by LocationPickerField/Modal and stored on profiles/venues.
export type LocationValue = {
  address: string;
  city: string | null;
  lat: number;
  lng: number;
};
