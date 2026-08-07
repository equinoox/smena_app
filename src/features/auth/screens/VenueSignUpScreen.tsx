// Venue sign-up — RHF + Zod wizard. Step 1 is the contact person's own credentials;
// step 2 asks whether they run a physical venue at all — "yes" shows the venue's
// identity fields (photos, name, type) and continues to step 3 (contact + description);
// "no" skips straight to submit (they'll only ever post venue-less temporary-job
// listings, see CreateListingScreen's "Bez lokala"). Creates the auth user (role=venue)
// and, unless venue-less, the venue record (incl. logo upload) once submitted.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CaretLeft,
  EnvelopeSimple,
  Lightning,
  Lock,
  Storefront,
  User,
} from "phosphor-react-native";
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
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { toSerbianPhone } from "@shared/lib/phone";
import { VENUE_TYPES } from "@shared/lib/roleIcon";
import { ProgressDots } from "@features/auth/components/ProgressDots";
import {
  VENUE_STEP1_FIELDS,
  VENUE_STEP2_FIELDS,
  venueSignUpSchema,
  type VenueSignUpValues,
} from "@features/auth/validation/authSchemas";
import { useSignUpVenue } from "@features/auth/hooks/useAuthMutations";

export function VenueSignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { complete } = useOnboardingStatus();
  const signUp = useSignUpVenue();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { control, handleSubmit, trigger, watch, setValue } = useForm<VenueSignUpValues>({
    resolver: zodResolver(venueSignUpSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      ownerPhone: "",
      hasVenue: true,
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

  const hasVenue = watch("hasVenue");

  const goToStep2 = async () => {
    if (await trigger(VENUE_STEP1_FIELDS)) setStep(2);
  };

  const goToStep3 = async () => {
    if (await trigger(VENUE_STEP2_FIELDS)) setStep(3);
  };

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(
      {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        ownerPhone: values.ownerPhone ? toSerbianPhone(values.ownerPhone) : undefined,
        hasVenue: values.hasVenue,
        venueName: values.venueName,
        venueType: values.venueType,
        location: values.location,
        pib: values.pib,
        phone: values.phone ? toSerbianPhone(values.phone) : undefined,
        description: values.description,
        logoUri: values.logoUri,
        coverPhotoUri: values.coverPhotoUri,
      },
      {
        onSuccess: (data) => {
          // signUp succeeded => a profile/venue now exists; onboarding never shows again.
          void complete();
          if (!data.session) {
            toast.info(t("auth.confirmEmail"));
            router.replace("/sign-in");
          }
        },
      },
    ),
  );

  // Step 2's own "Continue" acts as the final submit when there's no venue (no step 3).
  const onStep2Continue = hasVenue ? goToStep3 : onSubmit;

  return (
    <Screen scroll>
      <Pressable
        onPress={() => (step > 1 ? setStep((step - 1) as 1 | 2) : router.back())}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <View className="mt-5">
        <ProgressDots total={hasVenue ? 3 : 2} activeIndex={step - 1} />
      </View>

      {step === 1 ? (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.venueSignUpTitle")}
          </Text>

          <View className="mt-6 gap-4">
            <ControlledInput
              control={control}
              name="fullName"
              label={t("auth.fullName")}
              autoCapitalize="words"
              leftIcon={<User size={18} color={colors.textMuted} />}
            />
            <PhoneInput
              control={control}
              name="ownerPhone"
              label={t("auth.phoneOptional")}
            />
            <ControlledInput
              control={control}
              name="email"
              label={t("auth.email")}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<EnvelopeSimple size={18} color={colors.textMuted} />}
            />
            <ControlledInput
              control={control}
              name="password"
              label={t("auth.password")}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />
            <ControlledInput
              control={control}
              name="confirmPassword"
              label={t("auth.confirmPassword")}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />
          </View>

          <View className="mt-8 gap-4">
            <Button
              label={t("common.continue")}
              onPress={goToStep2}
              size="lg"
              rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
            />
            <View className="flex-row items-center justify-center gap-1">
              <Text className="font-sans text-sm text-text-tertiary">
                {t("auth.alreadyHaveAccount")}
              </Text>
              <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
                <Text className="font-sans-bold text-sm text-brand">
                  {t("auth.signIn")}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      ) : step === 2 ? (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.venueDetailsTitle")}
          </Text>
          <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
            {t("auth.venueDetailsSubtitle")}
          </Text>

          <View className="mt-6 gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("auth.hasVenueQuestion")}
            </Text>
            <View className="flex-row gap-2">
              {(
                [
                  { value: true, icon: Storefront, label: t("auth.hasVenueYes") },
                  { value: false, icon: Lightning, label: t("auth.hasVenueNo") },
                ] as const
              ).map(({ value, icon: Icon, label }) => {
                const selected = hasVenue === value;
                return (
                  <Pressable
                    key={String(value)}
                    onPress={() => setValue("hasVenue", value)}
                    className={cn(
                      "flex-1 items-center gap-2 rounded-input border p-3",
                      selected
                        ? "border-brand bg-bg-icon-tint"
                        : "border-border-default bg-bg-surface",
                    )}
                  >
                    <Icon
                      size={20}
                      weight="bold"
                      color={selected ? colors.brand : colors.textMuted}
                    />
                    <Text
                      className={cn(
                        "text-center font-sans-semibold text-sm",
                        selected ? "text-brand" : "text-text-muted",
                      )}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {hasVenue ? (
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
          ) : (
            <View className="mt-6 gap-1.5">
              <Text className="font-sans text-sm leading-5 text-text-secondary">
                {t("auth.hasVenueNoHint")}
              </Text>
              <View className="mt-3">
                <PhoneInput control={control} name="ownerPhone" label={t("auth.phone")} />
              </View>
            </View>
          )}

          <View className="mt-8">
            <Button
              label={t("common.continue")}
              onPress={onStep2Continue}
              loading={!hasVenue && signUp.isPending}
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
              label={t("common.continue")}
              onPress={onSubmit}
              loading={signUp.isPending}
              size="lg"
              rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
            />
          </View>
        </>
      )}
    </Screen>
  );
}
