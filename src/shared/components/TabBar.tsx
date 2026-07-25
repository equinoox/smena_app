// Custom bottom tab bar — token-styled (design colors), Phosphor icons, i18n labels.
// Used by app/(tabs)/_layout. Structurally typed to stay decoupled from router internals.
import {
  BookmarkSimple,
  Briefcase,
  House,
  Storefront,
  User,
} from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";

type Route = { key: string; name: string };
export type TabBarProps = {
  state: { index: number; routes: Route[] };
  navigation: { navigate: (name: string) => void };
  // Expo Router's `href: null` shortcut (see app/(tabs)/_layout) never reaches here as
  // `href` — withLayoutContext strips it and rewrites the screen's options to
  // `tabBarItemStyle: { display: "none" }` instead, which is what we actually have to
  // check. Loosely typed (`unknown`) since the real descriptor type carries much more
  // (and its `tabBarItemStyle` is a StyleProp union too messy to mirror here).
  descriptors: Record<string, { options?: Record<string, unknown> }>;
};

function isHiddenTab(options: Record<string, unknown> | undefined): boolean {
  const style = options?.tabBarItemStyle as { display?: string } | undefined;
  return style?.display === "none";
}

type PhosphorIcon = typeof House;

const ICONS: Record<string, PhosphorIcon> = {
  index: House,
  listings: Briefcase,
  saved: BookmarkSimple,
  "venue-profile": Storefront,
  profile: User,
};

const LABEL_KEYS: Record<string, TranslationKey> = {
  index: "nav.home",
  listings: "nav.listings",
  saved: "nav.saved",
  "venue-profile": "nav.venueProfile",
  profile: "nav.profile",
};

export function TabBar({ state, navigation, descriptors }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <View
      className="flex-row border-t border-border-default bg-bg-surface px-2 pt-2"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {state.routes.map((route, index) => {
        const Icon = ICONS[route.name];
        const labelKey = LABEL_KEYS[route.name];
        if (!Icon || !labelKey) return null;
        if (isHiddenTab(descriptors[route.key]?.options)) return null;

        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center gap-1 py-1"
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
          >
            <Icon
              size={24}
              weight={focused ? "fill" : "regular"}
              color={focused ? colors.brand : colors.textMuted}
            />
            <Text
              className={cn(
                "text-[11px]",
                focused
                  ? "font-sans-semibold text-brand"
                  : "font-sans-medium text-text-muted",
              )}
            >
              {t(labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
