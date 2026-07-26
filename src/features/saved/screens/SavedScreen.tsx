// Saved — the worker's bookmarked shifts (tab hidden for venues).
import { BookmarkSimple } from "phosphor-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListingList } from "@shared/components/ListingList";
import { WorkerIdentityBar } from "@shared/components/WorkerIdentityBar";
import { useSavedIds, useSavedListings, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { ListingWithVenue } from "@shared/types/domain.types";

export function SavedScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { profile } = useUserRole();
  const saved = useSavedListings();
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const header = (
    <View className="pb-4">
      {/* Same identity band as Home, minus the search box — just the top bar. Absorbs the
          status bar inset itself (see WorkerHomeView) so this surface color extends up
          behind it on Android instead of leaving a seam against bg-bg-screen. */}
      <View
        className="-mx-4 bg-bg-surface px-4 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <WorkerIdentityBar profile={profile} />
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <Text className="font-sans-extrabold text-2xl text-text-primary">
          {t("saved.title")}
        </Text>
        <Text className="font-sans-semibold text-sm text-text-tertiary">
          {t("saved.count", { count: saved.data?.length ?? 0 })}
        </Text>
      </View>
      <Text className="mt-1 font-sans text-sm text-text-tertiary">
        {t("saved.subtitle")}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-bg-screen">
      <ListingList
        listings={saved.data ?? []}
        isLoading={saved.isLoading}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        header={header}
        emptyTitle={t("saved.empty")}
        emptyDescription={t("saved.emptyDesc")}
        emptyIcon={<BookmarkSimple size={28} color={colors.textMuted} />}
        cardVariant="compact"
      />
    </View>
  );
}
