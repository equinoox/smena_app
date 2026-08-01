// Edit venue profile — same fields as venue sign-up's business-details step, pre-filled
// from the owner's existing venue record. Opened from the venue-profile tab's edit button.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { CaretLeft, Storefront } from "phosphor-react-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ControlledInput } from "@shared/components/ControlledInput";
import { ImagePickerField } from "@shared/components/ImagePickerField";
import { Loader } from "@shared/components/Loader";
import { LocationPickerField } from "@shared/components/LocationPickerField";
import { PhoneInput } from "@shared/components/PhoneInput";
import { Screen } from "@shared/components/Screen";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { fromSerbianPhone, toSerbianPhone } from "@shared/lib/phone";
import { VENUE_TYPES } from "@shared/lib/roleIcon";
import { useUpdateVenue } from "@features/profile/hooks/useUpdateVenue";
import {
  venueEditSchema,
  type VenueEditValues,
} from "@features/profile/validation/venueEditSchema";

export function EditVenueProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { venue, isLoading } = useMyVenue();
  const update = useUpdateVenue(venue?.id);

  const { control, handleSubmit, reset } = useForm<VenueEditValues>({
    resolver: zodResolver(venueEditSchema(t)),
    defaultValues: {
      venueName: "",
      venueType: "cafe",
      location: undefined,
      pib: "",
      phone: "",
      description: "",
      logoUri: undefined,
      coverPhotoUri: undefined,
    },
  });

  // Pre-fill once the venue record loads (defaultValues run before the query resolves).
  useEffect(() => {
    if (!venue) return;
    reset({
      venueName: venue.name,
      venueType: venue.venue_type,
      // Venues created before location-picking existed may have an address but no
      // coordinates yet — fall back to 0,0 rather than leaving the field unset.
      location: venue.address
        ? {
            address: venue.address,
            city: venue.city,
            lat: venue.lat ?? 0,
            lng: venue.lng ?? 0,
          }
        : undefined,
      pib: venue.pib ?? "",
      phone: fromSerbianPhone(venue.phone),
      description: venue.description ?? "",
    });
  }, [venue, reset]);

  const onSubmit = handleSubmit((values) =>
    update.mutate(
      {
        name: values.venueName,
        venueType: values.venueType,
        location: values.location,
        pib: values.pib,
        phone: toSerbianPhone(values.phone),
        description: values.description,
        logoUri: values.logoUri,
        coverPhotoUri: values.coverPhotoUri,
      },
      {
        onSuccess: () => {
          toast.success(t("common.saveSuccess"));
          router.back();
        },
      },
    ),
  );

  if (isLoading || !venue) return <Loader />;

  return (
    <Screen scroll>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
        {t("profile.editProfile")}
      </Text>

      <View className="mt-6 gap-4">
        <Controller
          control={control}
          name="coverPhotoUri"
          render={({ field }) => (
            <ImagePickerField
              value={field.value}
              existingUri={venue.cover_photo_url}
              onChange={field.onChange}
              label={t("profile.coverPhoto")}
              recommendedSize={t("imagePicker.coverSizeHint")}
              aspect={[9, 5]}
              wide
            />
          )}
        />

        <Controller
          control={control}
          name="logoUri"
          render={({ field }) => (
            <ImagePickerField
              value={field.value}
              existingUri={venue.logo_url}
              onChange={field.onChange}
              label={t("auth.venueLogo")}
              recommendedSize={t("imagePicker.squareSizeHint")}
              aspect={[1, 1]}
            />
          )}
        />

        <ControlledInput
          control={control}
          name="venueName"
          label={t("auth.venueName")}
          autoCapitalize="words"
          leftIcon={<Storefront size={18} color={colors.textMuted} />}
        />

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-text-tertiary">
            {t("auth.venueType")}
          </Text>
          <Controller
            control={control}
            name="venueType"
            render={({ field }) => (
              <View className="flex-row flex-wrap gap-2">
                {VENUE_TYPES.map((type) => (
                  <Chip
                    key={type}
                    label={t(`venueTypes.${type}` as TranslationKey)}
                    variant={field.value === type ? "active" : "neutral"}
                    size="lg"
                    onPress={() => field.onChange(type)}
                  />
                ))}
              </View>
            )}
          />
        </View>

        <Controller
          control={control}
          name="location"
          render={({ field, fieldState }) => (
            <LocationPickerField
              value={field.value}
              onChange={field.onChange}
              label={t("auth.address")}
              placeholder={t("auth.chooseOnMap")}
              error={fieldState.error?.message}
            />
          )}
        />

        <ControlledInput
          control={control}
          name="pib"
          label={t("auth.pib")}
          keyboardType="number-pad"
          placeholder="123456789"
        />

        <PhoneInput control={control} name="phone" label={t("auth.venuePhone")} />

        <ControlledInput
          control={control}
          name="description"
          label={t("auth.description")}
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="mt-8">
        <Button
          label={t("common.save")}
          onPress={onSubmit}
          loading={update.isPending}
          size="lg"
        />
      </View>
    </Screen>
  );
}
