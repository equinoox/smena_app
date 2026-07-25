// Venue sign-up — 2-step RHF + Zod wizard. Step 1 is the contact person's own
// credentials; step 2 is the venue's own details. Creates the auth user (role=venue)
// and the venue record (incl. logo upload) once step 2 submits.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CaretLeft,
  EnvelopeSimple,
  Image as ImageIcon,
  Lock,
  MapPin,
  Storefront,
  User,
} from "phosphor-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ControlledInput } from "@shared/components/ControlledInput";
import { Screen } from "@shared/components/Screen";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import type { VenueType } from "@shared/types/database.types";
import { ProgressDots } from "@features/auth/components/ProgressDots";
import {
  VENUE_STEP1_FIELDS,
  venueSignUpSchema,
  type VenueSignUpValues,
} from "@features/auth/validation/authSchemas";
import { useSignUpVenue } from "@features/auth/hooks/useAuthMutations";

const VENUE_TYPES: VenueType[] = ["cafe", "bar", "restaurant", "club", "bakery"];

export function VenueSignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { complete } = useOnboardingStatus();
  const signUp = useSignUpVenue();
  const [step, setStep] = useState<1 | 2>(1);

  const { control, handleSubmit, trigger } = useForm<VenueSignUpValues>({
    resolver: zodResolver(venueSignUpSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      venueName: "",
      venueType: "cafe",
      address: "",
      pib: "",
      phone: "",
      description: "",
      logoUri: undefined,
    },
  });

  // TODO: re-enable the logo picker once a dev-client build with expo-image-picker's
  // native module is installed — see VenueSignUpInput.logoUri / signUpVenue's upload step.

  const goNext = async () => {
    if (await trigger(VENUE_STEP1_FIELDS)) setStep(2);
  };

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(
      {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        venueName: values.venueName,
        venueType: values.venueType,
        address: values.address,
        pib: values.pib,
        phone: values.phone,
        description: values.description,
        logoUri: values.logoUri,
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

  return (
    <Screen scroll>
      <Pressable
        onPress={() => (step === 2 ? setStep(1) : router.back())}
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
              onPress={goNext}
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
      ) : (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.venueDetailsTitle")}
          </Text>
          <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
            {t("auth.venueDetailsSubtitle")}
          </Text>

          <View className="mt-6 gap-4">
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-input bg-bg-surface-alt">
                <ImageIcon size={22} color={colors.textMuted} />
              </View>
              <View className="gap-1">
                <Text className="font-sans-semibold text-sm text-text-primary">
                  {t("auth.venueLogo")}
                </Text>
                <Text className="font-sans-bold text-sm text-text-muted">
                  {t("auth.addPhoto")}
                </Text>
              </View>
            </View>

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

            <ControlledInput
              control={control}
              name="address"
              label={t("auth.address")}
              autoCapitalize="words"
              leftIcon={<MapPin size={18} color={colors.textMuted} />}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <ControlledInput
                  control={control}
                  name="pib"
                  label={t("auth.pib")}
                  keyboardType="number-pad"
                />
              </View>
              <View className="flex-1">
                <ControlledInput
                  control={control}
                  name="phone"
                  label={t("auth.venuePhone")}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

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
