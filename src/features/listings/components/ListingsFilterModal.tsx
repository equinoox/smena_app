// ListingsFilterModal — worker-facing filter sheet for the "browse all listings" screen:
// position, employment type, minimum pay, and proximity. Position/employment-type filter
// server-side (via useListings); pay/proximity are applied client-side by the caller
// (WorkerListingsView) since there's no PostGIS/pay query param.
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ChipSlider } from "@shared/components/ChipSlider";
import { DistanceFilterChips } from "@shared/components/DistanceFilterChips";
import { Input } from "@shared/components/Input";
import { Modal } from "@shared/components/Modal";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { useResponsive } from "@shared/lib/responsive";
import { WORKER_ROLES } from "@shared/lib/roleIcon";
import type { EmploymentType, WorkerRole } from "@shared/types/database.types";

const EMPLOYMENT_FILTERS: (EmploymentType | "all")[] = [
  "all",
  "fill_in",
  "part_time",
  "full_time",
];

export type ListingsFilterValues = {
  roleNeeded: WorkerRole | undefined;
  employmentType: EmploymentType | "all";
  minPay: number | null;
  maxDistanceKm: number | null;
};

export const DEFAULT_LISTINGS_FILTERS: ListingsFilterValues = {
  roleNeeded: undefined,
  employmentType: "all",
  minPay: null,
  maxDistanceKm: null,
};

type ListingsFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: ListingsFilterValues;
  onApply: (filters: ListingsFilterValues) => void;
};

export function ListingsFilterModal({
  visible,
  onClose,
  filters,
  onApply,
}: ListingsFilterModalProps) {
  const { t } = useTranslation();
  const { height } = useResponsive();
  const [draft, setDraft] = useState(filters);

  // Re-seed the draft from the currently-applied filters each time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const employmentLabel = (f: EmploymentType | "all") =>
    f === "all" ? t("listings.filterAll") : t(`employment.${f}` as TranslationKey);

  return (
    <Modal visible={visible} onClose={onClose} title={t("listings.filtersTitle")}>
      <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("auth.position")}
            </Text>
            <ChipSlider>
              <Chip
                label={t("listings.filterAll")}
                variant={!draft.roleNeeded ? "active" : "neutral"}
                onPress={() => setDraft({ ...draft, roleNeeded: undefined })}
              />
              {WORKER_ROLES.map((role) => (
                <Chip
                  key={role}
                  label={t(`roles.${role}` as TranslationKey)}
                  variant={draft.roleNeeded === role ? "active" : "neutral"}
                  onPress={() => setDraft({ ...draft, roleNeeded: role })}
                />
              ))}
            </ChipSlider>
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("createListing.employmentLabel")}
            </Text>
            <ChipSlider>
              {EMPLOYMENT_FILTERS.map((f) => (
                <Chip
                  key={f}
                  label={employmentLabel(f)}
                  variant={draft.employmentType === f ? "active" : "neutral"}
                  onPress={() => setDraft({ ...draft, employmentType: f })}
                />
              ))}
            </ChipSlider>
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("listings.minPay")}
            </Text>
            <Input
              value={draft.minPay != null ? String(draft.minPay) : ""}
              onChangeText={(v) => {
                const digits = v.replace(/[^\d]/g, "");
                setDraft({ ...draft, minPay: digits ? Number(digits) : null });
              }}
              keyboardType="number-pad"
              placeholder="RSD"
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("listings.distance")}
            </Text>
            <DistanceFilterChips
              value={draft.maxDistanceKm}
              onChange={(maxDistanceKm) => setDraft({ ...draft, maxDistanceKm })}
            />
          </View>

          <View className="mt-2 flex-row gap-3">
            <View className="flex-1">
              <Button
                label={t("common.reset")}
                variant="secondary"
                onPress={() => {
                  setDraft(DEFAULT_LISTINGS_FILTERS);
                  onApply(DEFAULT_LISTINGS_FILTERS);
                  onClose();
                }}
              />
            </View>
            <View className="flex-1">
              <Button
                label={t("listings.applyFilters")}
                onPress={() => {
                  onApply(draft);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
