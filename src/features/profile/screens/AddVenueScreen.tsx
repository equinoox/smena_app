// Add venue — 2-step wizard for adding another lokal under an already-signed-in owner.
// Same fields/schema as VenueSignUpScreen's step 2 (identity) and step 3 (contact), just
// without the account-credentials step (the account already exists). Reached from the "+"
// button on a venue profile or the "Moji lokali" list.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowRight, CaretLeft, Storefront } from "phosphor-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ChipSlider } from "@shared/components/ChipSlider";
import { ControlledInput } from "@shared/components/ControlledInput";
import { ImagePickerField } from "@shared/components/ImagePickerField";
import { LocationPickerField } from "@shared/components/LocationPickerField";
import { PhoneInput } from "@shared/components/PhoneInput";
import { Screen } from "@shared/components/Screen";
import { useSetActiveVenue } from "@shared/hooks/useActiveVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { toSerbianPhone } from "@shared/lib/phone";
import { VENUE_TYPES } from "@shared/lib/roleIcon";
import { ProgressDots } from "@features/auth/components/ProgressDots";
import { useCreateVenue } from "@features/profile/hooks/useCreateVenue";
import {
  venueEditSchema,
  type VenueEditValues,
} from "@features/profile/validation/venueEditSchema";

const STEP1_FIELDS = ["venueName", "venueType"] as const;

export function AddVenueScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const create = useCreateVenue();
  const setActiveVenueId = useSetActiveVenue();
  const [step, setStep] = useState<1 | 2>(1);

  const { control, handleSubmit, trigger } = useForm<VenueEditValues>({
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

  const goToStep2 = async () => {
    if (await trigger(STEP1_FIELDS)) setStep(2);
  };

  const onSubmit = handleSubmit((values) =>
    create.mutate(
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
        onSuccess: (venue) => {
          void setActiveVenueId(venue.id);
          toast.success(t("myVenues.addSuccess"));
          router.replace(`/venue-profile/${venue.id}`);
        },
      },
    ),
  );

  return (
    <Screen scroll>
      <Pressable
        onPress={() => (step > 1 ? setStep(1) : router.back())}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <View className="mt-5">
        <ProgressDots total={2} activeIndex={step - 1} />
      </View>

      {step === 1 ? (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.venueDetailsTitle")}
          </Text>
          <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
            {t("auth.venueDetailsSubtitle")}
          </Text>

          <View className="mt-6 gap-4">
            <Controller
              control={control}
              name="coverPhotoUri"
              render={({ field }) => (
                <ImagePickerField
                  value={field.value}
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
                  <ChipSlider>
                    {VENUE_TYPES.map((type) => (
                      <Chip
                        key={type}
                        label={t(`venueTypes.${type}` as TranslationKey)}
                        variant={field.value === type ? "active" : "neutral"}
                        size="lg"
                        onPress={() => field.onChange(type)}
                      />
                    ))}
                  </ChipSlider>
                )}
              />
            </View>
          </View>

          <View className="mt-8">
            <Button
              label={t("common.continue")}
              onPress={goToStep2}
              size="lg"
              rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
            />
          </View>
        </>
      ) : (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.venueContactTitle")}
          </Text>

          <View className="mt-6 gap-4">
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
              numberOfLines={4}
            />
          </View>

          <View className="mt-8">
            <Button
              label={t("myVenues.addVenue")}
              onPress={onSubmit}
              loading={create.isPending}
              size="lg"
              rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
            />
          </View>
        </>
      )}
    </Screen>
  );
}
