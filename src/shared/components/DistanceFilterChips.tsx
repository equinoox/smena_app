// DistanceFilterChips — preset proximity radius chips (<1/<2/<5/<10 km), single-select;
// tapping the active one again clears it. Shared by the listings and workers filter
// modals, which both need identical "how close" filtering.
import { Chip } from "@shared/components/Chip";
import { ChipSlider } from "@shared/components/ChipSlider";

const PRESETS_KM = [1, 2, 5, 10];

type DistanceFilterChipsProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function DistanceFilterChips({ value, onChange }: DistanceFilterChipsProps) {
  return (
    <ChipSlider>
      {PRESETS_KM.map((km) => {
        const selected = value === km;
        return (
          <Chip
            key={km}
            label={`< ${km} km`}
            variant={selected ? "active" : "neutral"}
            size="lg"
            onPress={() => onChange(selected ? null : km)}
          />
        );
      })}
    </ChipSlider>
  );
}
