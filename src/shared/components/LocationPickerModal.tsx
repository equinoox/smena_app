// LocationPickerModal — full-screen map picker: search an address, drag the map
// under a fixed center pin, or use the device's current location; confirms a
// reverse-geocoded LocationValue. Own RNModal (not Modal.tsx, which is a centered
// dialog card unsuitable for a map).
import { Camera, MapView, type MapState } from "@rnmapbox/maps";
import {
  CaretLeft,
  Crosshair,
  MagnifyingGlass,
  MapPin,
  MapPinLine,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { isMapboxConfigured, MAPBOX_STYLE_URL } from "@shared/lib/mapbox";
import { forwardGeocode, reverseGeocode } from "@shared/lib/mapboxGeocoding";
import { useResponsive } from "@shared/lib/responsive";
import { useTheme } from "@shared/providers/ThemeProvider";
import type { LocationValue } from "@shared/types/location.types";

const BELGRADE: [number, number] = [20.4489, 44.7866];
const SEARCH_DEBOUNCE_MS = 350;
const CAMERA_DEBOUNCE_MS = 400;

type LocationPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: LocationValue) => void;
  initialValue?: LocationValue;
};

export function LocationPickerModal({
  visible,
  onClose,
  onConfirm,
  initialValue,
}: LocationPickerModalProps) {
  const colors = useThemeColors();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { scale } = useResponsive();

  const cameraRef = useRef<Camera>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Coordinates of the last resolve() call (in flight or finished) — the map view
  // fires onCameraChanged once as the camera settles right after mount, on top of the
  // explicit initial resolve below; without this dedupe both fire near-simultaneously
  // and the loading indicator flickers on/off for the same address.
  const lastResolvedCoordsRef = useRef<[number, number] | null>(
    initialValue ? [initialValue.lat, initialValue.lng] : null,
  );

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationValue[]>([]);
  const [resolved, setResolved] = useState<LocationValue | null>(
    initialValue ?? null,
  );
  const [resolving, setResolving] = useState(false);

  const initialCenter: [number, number] = initialValue
    ? [initialValue.lng, initialValue.lat]
    : BELGRADE;

  // ~50m — ignores camera-settle jitter/duplicate fires for essentially the same spot.
  const COORD_EPSILON = 0.0005;
  const isSameCoords = (a: [number, number], b: [number, number]) =>
    Math.abs(a[0] - b[0]) < COORD_EPSILON && Math.abs(a[1] - b[1]) < COORD_EPSILON;

  const resolveNow = async (lat: number, lng: number) => {
    if (
      lastResolvedCoordsRef.current &&
      isSameCoords(lastResolvedCoordsRef.current, [lat, lng])
    ) {
      return;
    }
    lastResolvedCoordsRef.current = [lat, lng];
    setResolving(true);
    try {
      const value = await reverseGeocode(lat, lng);
      setResolved(value);
    } catch {
      // Keep the last resolved value; the user can still retry by moving the map.
    } finally {
      setResolving(false);
    }
  };

  // Reset local state each time the modal is (re)opened. When there's no starting
  // value yet (fresh pick), resolve the default Belgrade center immediately so the
  // Confirm button isn't stuck disabled until the user pans the map.
  useEffect(() => {
    if (!visible) return;
    setQuery("");
    setSuggestions([]);
    setResolved(initialValue ?? null);
    lastResolvedCoordsRef.current = initialValue
      ? [initialValue.lat, initialValue.lng]
      : null;
    if (!initialValue) void resolveNow(BELGRADE[1], BELGRADE[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const runReverseGeocode = (lat: number, lng: number) => {
    if (cameraTimer.current) clearTimeout(cameraTimer.current);
    cameraTimer.current = setTimeout(() => void resolveNow(lat, lng), CAMERA_DEBOUNCE_MS);
  };

  const onCameraChanged = (state: MapState) => {
    const [lng, lat] = state.properties.center;
    runReverseGeocode(lat, lng);
  };

  const onSearchChange = (text: string) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await forwardGeocode(text);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const selectSuggestion = (value: LocationValue) => {
    setSuggestions([]);
    setQuery("");
    setResolved(value);
    lastResolvedCoordsRef.current = [value.lat, value.lng];
    cameraRef.current?.setCamera({
      centerCoordinate: [value.lng, value.lat],
      zoomLevel: 15,
      animationDuration: 500,
    });
  };

  const useCurrentLocation = async () => {
    try {
      const ExpoLocation =
        require("expo-location") as typeof import("expo-location");
      const permission = await ExpoLocation.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        toast.error(t("location.permissionDenied"));
        return;
      }
      const position = await ExpoLocation.getCurrentPositionAsync();
      cameraRef.current?.setCamera({
        centerCoordinate: [position.coords.longitude, position.coords.latitude],
        zoomLevel: 15,
        animationDuration: 500,
      });
    } catch (error) {
      console.error("[Location picker error]", error);
      toast.error(t("location.permissionDenied"));
    }
  };

  const confirm = () => {
    if (!resolved) return;
    onConfirm(resolved);
  };

  const pinSize = scale(36);

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
        <View className="gap-2 px-4 pb-3 pt-2">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
            >
              <CaretLeft size={20} color={colors.textPrimary} />
            </Pressable>
            <View className="flex-1">
              <Input
                value={query}
                onChangeText={onSearchChange}
                placeholder={t("location.searchPlaceholder")}
                leftIcon={<MagnifyingGlass size={18} color={colors.textMuted} />}
                autoCapitalize="words"
              />
            </View>
          </View>

          {suggestions.length > 0 ? (
            <View className="gap-1 rounded-input border border-border-default bg-bg-surface p-1">
              {suggestions.map((item, index) => (
                <Pressable
                  key={`${item.lat}-${item.lng}-${index}`}
                  onPress={() => selectSuggestion(item)}
                  className="flex-row items-start gap-2 rounded-input px-2 py-2 active:bg-bg-surface-alt"
                >
                  <MapPinLine size={16} color={colors.textMuted} />
                  <View className="flex-1">
                    <Text className="font-sans-medium text-sm text-text-primary">
                      {item.address}
                    </Text>
                    {item.city ? (
                      <Text className="font-sans text-xs text-text-tertiary">
                        {item.city}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View className="flex-1">
          {isMapboxConfigured ? (
            <>
              <MapView
                style={{ flex: 1 }}
                styleURL={MAPBOX_STYLE_URL[colorScheme]}
                onCameraChanged={onCameraChanged}
              >
                <Camera
                  ref={cameraRef}
                  defaultSettings={{ centerCoordinate: initialCenter, zoomLevel: 12 }}
                />
              </MapView>

              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  marginLeft: -pinSize / 2,
                  marginTop: -pinSize,
                }}
              >
                <MapPin size={pinSize} weight="fill" color={colors.brand} />
              </View>

              <Pressable
                onPress={useCurrentLocation}
                className="absolute bottom-24 right-4 h-12 w-12 items-center justify-center rounded-full border border-border-default bg-bg-surface"
              >
                <Crosshair size={22} color={colors.textPrimary} />
              </Pressable>
            </>
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center font-sans-medium text-sm text-text-tertiary">
                {t("location.notConfigured")}
              </Text>
            </View>
          )}
        </View>

        <View className="gap-3 border-t border-border-default bg-bg-screen px-4 pb-4 pt-3">
          <View className="min-h-5 flex-row items-center gap-2">
            {resolving ? (
              <>
                <ActivityIndicator size="small" color={colors.brand} />
                <Text className="font-sans text-sm text-text-tertiary">
                  {t("location.locating")}
                </Text>
              </>
            ) : resolved ? (
              <Text
                className="flex-1 font-sans-medium text-sm text-text-primary"
                numberOfLines={2}
              >
                {resolved.address}
              </Text>
            ) : null}
          </View>
          <Button
            label={t("location.confirmLocation")}
            onPress={confirm}
            disabled={!resolved || resolving}
          />
        </View>
      </SafeAreaView>
    </RNModal>
  );
}
