// Worker sign-up — 3-step RHF + Zod wizard, mirroring the venue flow. Step 1 is the
// worker's own credentials; step 2 is their basic profile; step 3 is their bio, skills,
// and a work-experience entry. Creates the auth user (role=worker) once step 3 submits;
// trigger creates the base profile row, then we backfill the rest once a session exists.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CaretLeft,
  EnvelopeSimple,
  Lock,
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
import { TagInput } from "@shared/components/TagInput";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { toSerbianPhone } from "@shared/lib/phone";
import { EXPERIENCE_LEVELS, WORKER_ROLES } from "@shared/lib/roleIcon";
import { ProgressDots } from "@features/auth/components/ProgressDots";
import {
  WORKER_STEP1_FIELDS,
  WORKER_STEP2_FIELDS,
  workerSignUpSchema,
  type WorkerSignUpValues,
} from "@features/auth/validation/authSchemas";
import { useSignUpWorker } from "@features/auth/hooks/useAuthMutations";

export function WorkerSignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { complete } = useOnboardingStatus();
  const signUp = useSignUpWorker();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { control, handleSubmit, trigger } = useForm<WorkerSignUpValues>({
    resolver: zodResolver(workerSignUpSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      location: undefined,
      experienceLevel: undefined,
      avatarUri: undefined,
      bio: "",
      skills: [],
      workerRoles: [],
    },
  });

  const goToStep2 = async () => {
    if (await trigger(WORKER_STEP1_FIELDS)) setStep(2);
  };

  const goToStep3 = async () => {
    if (await trigger(WORKER_STEP2_FIELDS)) setStep(3);
  };

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(
      {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: toSerbianPhone(values.phone),
        location: values.location,
        experienceLevel: values.experienceLevel,
        avatarUri: values.avatarUri,
        bio: values.bio,
        skills: values.skills,
        workerRoles: values.workerRoles,
      },
      {
        onSuccess: (data) => {
          // signUp succeeded => a profile now exists; onboarding never needs to show again.
          void complete();
          // No session => email confirmation is on; send them to sign in.
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
        onPress={() => (step > 1 ? setStep((step - 1) as 1 | 2) : router.back())}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <View className="mt-5">
        <ProgressDots total={3} activeIndex={step - 1} />
      </View>

      {step === 1 ? (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.workerSignUpTitle")}
          </Text>

          <View className="mt-6 gap-4">
            <Controller
              control={control}
              name="avatarUri"
              render={({ field }) => (
                <ImagePickerField
                  value={field.value}
                  onChange={field.onChange}
                  label={t("auth.profilePicture")}
                  recommendedSize={t("imagePicker.squareSizeHint")}
                  aspect={[1, 1]}
                />
              )}
            />

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
            {t("auth.workerDetailsTitle")}
          </Text>
          <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
            {t("auth.workerDetailsSubtitle")}
          </Text>

          <View className="mt-6 gap-4">
            <Controller
              control={control}
              name="location"
              render={({ field, fieldState }) => (
                <LocationPickerField
                  value={field.value}
                  onChange={field.onChange}
                  label={t("auth.homeAddress")}
                  placeholder={t("auth.chooseOnMap")}
                  error={fieldState.error?.message}
                />
              )}
            />

            <PhoneInput control={control} name="phone" label={t("auth.phone")} />
          </View>

          <View className="mt-8">
            <Button
              label={t("common.continue")}
              onPress={goToStep3}
              size="lg"
              rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
            />
          </View>
        </>
      ) : (
        <>
          <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
            {t("auth.workerExperienceTitle")}
          </Text>
          <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
            {t("auth.workerExperienceSubtitle")}
          </Text>

          <View className="mt-6 gap-5">
            <ControlledInput
              control={control}
              name="bio"
              label={t("auth.bio")}
              placeholder={t("auth.bioPlaceholder")}
              multiline
              numberOfLines={4}
            />

            <View className="gap-2">
              <Text className="font-sans-medium text-sm text-text-tertiary">
                {t("auth.skills")}
              </Text>
              <Controller
                control={control}
                name="skills"
                render={({ field, fieldState }) => (
                  <>
                    <TagInput
                      tags={field.value}
                      onChange={field.onChange}
                      addLabel={t("auth.addSkill")}
                      placeholder={t("auth.skillPlaceholder")}
                    />
                    {fieldState.error ? (
                      <Text className="font-sans text-xs text-warning">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </>
                )}
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="font-sans-medium text-sm text-text-tertiary">
                  {t("auth.position")}
                </Text>
                <Text className="font-sans text-xs text-text-muted">
                  · {t("auth.positionHint")}
                </Text>
              </View>
              <Controller
                control={control}
                name="workerRoles"
                render={({ field, fieldState }) => (
                  <>
                    <ChipSlider>
                      {WORKER_ROLES.map((role) => {
                        const selected = field.value.includes(role);
                        return (
                          <Chip
                            key={role}
                            label={t(`roles.${role}` as TranslationKey)}
                            variant={selected ? "active" : "neutral"}
                            size="lg"
                            onPress={() => {
                              if (selected) {
                                field.onChange(field.value.filter((r) => r !== role));
                                return;
                              }
                              if (field.value.length >= 3) {
                                toast.info(t("validation.selectPositionMax"));
                                return;
                              }
                              field.onChange([...field.value, role]);
                            }}
                          />
                        );
                      })}
                    </ChipSlider>
                    {fieldState.error ? (
                      <Text className="font-sans text-xs text-warning">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </>
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="font-sans-medium text-sm text-text-tertiary">
                {t("auth.experience")}
              </Text>
              <Controller
                control={control}
                name="experienceLevel"
                render={({ field, fieldState }) => (
                  <>
                    <View className="flex-row rounded-input border border-border-default bg-bg-surface p-1">
                      {EXPERIENCE_LEVELS.map((level) => {
                        const selected = field.value === level;
                        return (
                          <Pressable
                            key={level}
                            onPress={() => field.onChange(level)}
                            className={cn(
                              "flex-1 items-center justify-center rounded-chip py-2.5",
                              selected && "bg-bg-surface-alt",
                            )}
                          >
                            <Text
                              className={cn(
                                "font-sans-semibold text-sm",
                                selected ? "text-text-primary" : "text-text-muted",
                              )}
                            >
                              {t(`experience.${level}` as TranslationKey)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {fieldState.error ? (
                      <Text className="font-sans text-xs text-warning">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </>
                )}
              />
            </View>
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
