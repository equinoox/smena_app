// LocationViewModal — read-only map showing a pinned location (e.g. a listing's venue),
// plus the signed-in user's own location alongside it when known, so they can see where
// it is relative to them. Unlike LocationPickerModal, nothing here is editable.
import { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";
import { CaretLeft, MapPin } from "phosphor-react-native";
import { useRef } from "react";
import { Modal as RNModal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { formatDistanceKm } from "@shared/lib/format";
import { haversineDistanceKm } from "@shared/lib/geo";
import { isMapboxConfigured, MAPBOX_STYLE_URL } from "@shared/lib/mapbox";
import { useTheme } from "@shared/providers/ThemeProvider";

type Coordinates = { lat: number; lng: number };

type LocationViewModalProps = {
  visible: boolean;
  onClose: () => void;
  address: string | null;
  target: Coordinates;
  // The viewer's own location — when known, both pins show and the camera fits both.
  origin?: Coordinates;
};

// Padding (degrees) added around the two-point bounding box so neither pin sits flush
// against the map edge.
const BOUNDS_PADDING_DEG = 0.01;

export function LocationViewModal({
  visible,
  onClose,
  address,
  target,
  origin,
}: LocationViewModalProps) {
  const colors = useThemeColors();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const cameraRef = useRef<Camera>(null);

  const distanceKm = origin ? haversineDistanceKm(origin, target) : null;

  const cameraDefaults = origin
    ? {
        bounds: {
          ne: [
            Math.max(target.lng, origin.lng) + BOUNDS_PADDING_DEG,
            Math.max(target.lat, origin.lat) + BOUNDS_PADDING_DEG,
          ] as [number, number],
          sw: [
            Math.min(target.lng, origin.lng) - BOUNDS_PADDING_DEG,
            Math.min(target.lat, origin.lat) - BOUNDS_PADDING_DEG,
          ] as [number, number],
          paddingLeft: 60,
          paddingRight: 60,
          paddingTop: 100,
          paddingBottom: 100,
        },
      }
    : { centerCoordinate: [target.lng, target.lat] as [number, number], zoomLevel: 14 };

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
        <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
          >
            <CaretLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <View className="flex-1">
            <Text
              className="font-sans-bold text-base text-text-primary"
              numberOfLines={1}
            >
              {address ?? ""}
            </Text>
            {distanceKm != null ? (
              <Text className="font-sans-medium text-xs text-success">
                {t("location.distanceAway", { distance: formatDistanceKm(distanceKm) })}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-1">
          {isMapboxConfigured ? (
            <MapView style={{ flex: 1 }} styleURL={MAPBOX_STYLE_URL[colorScheme]}>
              <Camera ref={cameraRef} defaultSettings={cameraDefaults} />
              <PointAnnotation id="target" coordinate={[target.lng, target.lat]}>
                <View>
                  <MapPin size={32} weight="fill" color={colors.brand} />
                </View>
              </PointAnnotation>
              {origin ? (
                <PointAnnotation id="origin" coordinate={[origin.lng, origin.lat]}>
                  <View className="h-4 w-4 rounded-full border-2 border-bg-surface bg-info" />
                </PointAnnotation>
              ) : null}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center font-sans-medium text-sm text-text-tertiary">
                {t("location.notConfigured")}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </RNModal>
  );
}
