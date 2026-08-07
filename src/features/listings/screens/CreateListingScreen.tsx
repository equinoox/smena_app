// CreateListingScreen — venue "post a shift" form: which lokal it belongs to (if the owner
// runs more than one, or none at all for a temporary-job ad), position, title, employment
// type, optional daily working hours, optional pay, description, custom requirement tags,
// urgent toggle. Also doubles as the "edit listing" form: an `id` search param switches
// it into edit mode, prefilling from the existing listing and updating instead of
// creating.
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Briefcase,
  Clock,
  Lightning,
  PaperPlaneRight,
  Wallet,
  X,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Switch, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ChipSlider } from "@shared/components/ChipSlider";
import { ControlledInput } from "@shared/components/ControlledInput";
import { Input } from "@shared/components/Input";
import { Loader } from "@shared/components/Loader";
import { LocationPickerField } from "@shared/components/LocationPickerField";
import { Modal } from "@shared/components/Modal";
import { Screen } from "@shared/components/Screen";
import { ListingCard } from "@shared/components/ListingCard";
import { TagInput } from "@shared/components/TagInput";
import { useActiveVenue } from "@shared/hooks/useActiveVenue";
import { useAuth } from "@shared/hooks/useAuth";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { formatHour } from "@shared/lib/format";
import { WORKER_ROLES } from "@shared/lib/roleIcon";
import type {
  EmploymentType,
  PayPeriod,
  WorkerRole,
} from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import type { LocationValue } from "@shared/types/location.types";
import { TimeRangePickerModal } from "@features/listings/components/TimeRangePickerModal";
import {
  useCreateListing,
  useListing,
  useUpdateListing,
} from "@features/listings/hooks/useListings";

const EMPLOYMENT_TYPES: { value: EmploymentType; icon: typeof Lightning }[] = [
  { value: "fill_in", icon: Lightning },
  { value: "part_time", icon: Clock },
  { value: "full_time", icon: Briefcase },
];

// No explicit pay-period selector in the design — infer it from employment type
// (matches the labels: Ispomoć/hourly, Dnevnica/daily-shift, Stalno/monthly).
const DEFAULT_PAY_PERIOD: Record<EmploymentType, PayPeriod> = {
  fill_in: "hour",
  part_time: "shift",
  full_time: "month",
};

type FormValues = {
  roleNeeded: WorkerRole;
  title: string;
  employmentType: EmploymentType;
  payAmount: string;
  description: string;
};

export function CreateListingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { profile } = useUserRole();
  const { venue: activeVenue, venues } = useActiveVenue();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!editId;
  const existingListing = useListing(editId ?? "");

  // null = "Bez lokala" (a temporary-job listing not tied to any venue).
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [noVenueLocation, setNoVenueLocation] = useState<LocationValue | undefined>();
  const createListing = useCreateListing(selectedVenueId ?? undefined);
  const updateListing = useUpdateListing(selectedVenueId ?? undefined);

  const [fromHour, setFromHour] = useState<number | null>(null);
  const [toHour, setToHour] = useState<number | null>(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { control, handleSubmit, watch, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      roleNeeded: "waiter",
      title: "",
      employmentType: "fill_in",
      payAmount: "",
      description: "",
    },
  });

  // Default the venue picker to the active venue, once it's loaded — a ref guard so a
  // later refetch doesn't clobber a venue the owner already picked by hand.
  const venueDefaultedRef = useRef(false);
  useEffect(() => {
    if (isEdit || venueDefaultedRef.current || !activeVenue) return;
    venueDefaultedRef.current = true;
    setSelectedVenueId(activeVenue.id);
  }, [isEdit, activeVenue]);

  // Prefill once the existing listing loads (edit mode only) — a ref guard keeps a
  // later refetch (e.g. right after saving) from clobbering in-progress edits.
  const prefilledRef = useRef(false);
  useEffect(() => {
    const existing = existingListing.data;
    if (!isEdit || !existing || prefilledRef.current) return;
    prefilledRef.current = true;
    reset({
      roleNeeded: existing.role_needed,
      title: existing.title,
      employmentType: existing.employment_type,
      payAmount: existing.pay_amount != null ? String(existing.pay_amount) : "",
      description: existing.description ?? "",
    });
    setRequirements(existing.requirements);
    setIsUrgent(existing.is_urgent);
    setFromHour(existing.start_hour);
    setToHour(existing.end_hour);
    setSelectedVenueId(existing.venue_id);
    if (!existing.venue_id) {
      setNoVenueLocation({
        address: existing.address ?? "",
        city: existing.city,
        lat: existing.lat ?? 0,
        lng: existing.lng ?? 0,
      });
    }
    // Only ever prefill from the fetched row itself, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingListing.data, isEdit]);

  const employmentType = watch("employmentType");
  const payPeriod = DEFAULT_PAY_PERIOD[employmentType];
  const hasVenue = selectedVenueId !== null;
  const selectedVenue = venues.find((v) => v.id === selectedVenueId) ?? null;
  const availableEmploymentTypes = hasVenue
    ? EMPLOYMENT_TYPES
    : EMPLOYMENT_TYPES.filter((e) => e.value !== "full_time");

  // A permanent role implies a real place of work — matches the DB check constraint.
  useEffect(() => {
    if (!hasVenue && employmentType === "full_time") {
      setValue("employmentType", "fill_in");
    }
  }, [hasVenue, employmentType, setValue]);

  const onSubmit = handleSubmit((values) => {
    if (!user) return;
    if (!hasVenue && !noVenueLocation) {
      toast.error(t("createListing.noVenueLocationRequired"));
      return;
    }

    const input = {
      title: values.title,
      roleNeeded: values.roleNeeded,
      employmentType: values.employmentType,
      description: values.description || undefined,
      payAmount: values.payAmount ? Number(values.payAmount) : undefined,
      payPeriod,
      startHour: fromHour ?? undefined,
      endHour: toHour ?? undefined,
      isUrgent,
      requirements,
      location: hasVenue ? undefined : noVenueLocation,
    };

    if (isEdit && editId) {
      updateListing.mutate(
        { id: editId, input },
        {
          onSuccess: () => {
            toast.success(t("createListing.updateSuccess"));
            router.back();
          },
        },
      );
      return;
    }

    createListing.mutate(
      { ...input, ownerId: user.id, venueId: selectedVenueId ?? undefined },
      {
        onSuccess: () => {
          toast.success(t("createListing.publishSuccess"));
          router.back();
        },
      },
    );
  });

  const previewListing: ListingWithVenue | null = user
    ? {
        id: "preview",
        owner_id: user.id,
        venue_id: selectedVenue?.id ?? null,
        title: watch("title"),
        role_needed: watch("roleNeeded"),
        employment_type: employmentType,
        description: watch("description") || null,
        pay_amount: watch("payAmount") ? Number(watch("payAmount")) : null,
        pay_period: payPeriod,
        currency: "RSD",
        start_hour: fromHour,
        end_hour: toHour,
        is_urgent: isUrgent,
        status: "open",
        requirements,
        address: selectedVenue ? null : noVenueLocation?.address ?? null,
        city: selectedVenue ? null : noVenueLocation?.city ?? null,
        lat: selectedVenue ? null : noVenueLocation?.lat ?? null,
        lng: selectedVenue ? null : noVenueLocation?.lng ?? null,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString(),
        venue: selectedVenue
          ? {
              id: selectedVenue.id,
              name: selectedVenue.name,
              venue_type: selectedVenue.venue_type,
              city: selectedVenue.city,
              address: selectedVenue.address,
              logo_url: selectedVenue.logo_url,
              cover_photo_url: selectedVenue.cover_photo_url,
              lat: selectedVenue.lat,
              lng: selectedVenue.lng,
              phone: selectedVenue.phone,
              rating_avg: selectedVenue.rating_avg,
              rating_count: selectedVenue.rating_count,
            }
          : null,
        owner: profile
          ? {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              phone: profile.phone,
            }
          : null,
      }
    : null;

  if (isEdit && existingListing.isLoading) return <Loader />;

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text className="font-sans-extrabold text-lg text-text-primary">
          {isEdit ? t("createListing.editTitle") : t("createListing.title")}
        </Text>
        <View className="h-10 w-10" />
      </View>

      {!isEdit && venues.length >= 1 ? (
        <View className="mt-4 gap-2">
          <Text className="font-sans-medium text-sm text-text-tertiary">
            {t("createListing.venueLabel")}
          </Text>
          <ChipSlider>
            {venues.map((v) => (
              <Chip
                key={v.id}
                label={v.name}
                variant={selectedVenueId === v.id ? "active" : "neutral"}
                size="lg"
                onPress={() => setSelectedVenueId(v.id)}
              />
            ))}
            <Chip
              label={t("createListing.noVenue")}
              variant={selectedVenueId === null ? "active" : "neutral"}
              size="lg"
              onPress={() => setSelectedVenueId(null)}
            />
          </ChipSlider>
        </View>
      ) : null}

      {!hasVenue ? (
        <View className="mt-4">
          <LocationPickerField
            value={noVenueLocation}
            onChange={setNoVenueLocation}
            label={t("createListing.jobLocationLabel")}
            placeholder={t("auth.chooseOnMap")}
          />
        </View>
      ) : null}

      <View className="mt-4 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.positionQuestion")}
        </Text>
        <Controller
          control={control}
          name="roleNeeded"
          render={({ field }) => (
            <ChipSlider>
              {WORKER_ROLES.map((role) => (
                <Chip
                  key={role}
                  label={t(`roles.${role}` as TranslationKey)}
                  variant={field.value === role ? "active" : "neutral"}
                  size="lg"
                  onPress={() => field.onChange(role)}
                />
              ))}
            </ChipSlider>
          )}
        />
      </View>

      <View className="mt-5 gap-1.5">
        <ControlledInput
          control={control}
          name="title"
          label={t("createListing.titleLabel")}
        />
        <Text className="font-sans text-xs text-text-muted">
          {t("createListing.titleHint")}
        </Text>
      </View>

      <View className="mt-5 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.employmentLabel")}
        </Text>
        <Controller
          control={control}
          name="employmentType"
          render={({ field }) => (
            <View className="flex-row gap-2">
              {availableEmploymentTypes.map(({ value, icon: Icon }) => {
                const selected = field.value === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => field.onChange(value)}
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
                      {t(`employment.${value}` as TranslationKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
        {!hasVenue ? (
          <Text className="font-sans text-xs text-text-muted">
            {t("createListing.noVenueFullTimeHint")}
          </Text>
        ) : null}
      </View>

      <View className="mt-5 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.workingHoursLabel")} · {t("createListing.optional")}
        </Text>
        <Pressable
          onPress={() => setTimePickerOpen(true)}
          className="h-12 flex-row items-center gap-2 rounded-input border border-border-default bg-bg-surface px-3"
        >
          <Clock size={18} color={colors.textMuted} />
          <Text className="font-sans-semibold text-base text-text-primary">
            {fromHour !== null && toHour !== null
              ? `${formatHour(fromHour, language)} - ${formatHour(toHour, language)}`
              : t("createListing.selectTime")}
          </Text>
        </Pressable>
      </View>

      <View className="mt-5 gap-1.5">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.compensation")} · {t("createListing.optional")}
        </Text>
        <Controller
          control={control}
          name="payAmount"
          render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={(v) => field.onChange(v.replace(/[^\d]/g, ""))}
              keyboardType="number-pad"
              leftIcon={<Wallet size={18} color={colors.textMuted} />}
              rightIcon={
                <Text className="font-sans-semibold text-sm text-text-muted">
                  RSD {t(`pay.${payPeriod}` as TranslationKey)}
                </Text>
              }
            />
          )}
        />
      </View>

      <View className="mt-5">
        <ControlledInput
          control={control}
          name="description"
          label={t("createListing.descriptionLabel")}
          multiline
          numberOfLines={4}
        />
      </View>

      <View className="mt-5 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.requirementsLabel")}
        </Text>
        <TagInput
          tags={requirements}
          onChange={setRequirements}
          addLabel={t("createListing.addRequirement")}
          placeholder={t("createListing.requirementPlaceholder")}
        />
      </View>

      <View className="mt-5 flex-row items-center justify-between gap-3 rounded-input border border-border-default bg-bg-surface p-3">
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-text-primary">
            {t("createListing.markUrgent")}
          </Text>
          <Text className="mt-0.5 font-sans text-xs text-text-muted">
            {t("createListing.markUrgentHint")}
          </Text>
        </View>
        <Switch
          value={isUrgent}
          onValueChange={setIsUrgent}
          trackColor={{ false: colors.borderDefault, true: colors.brand }}
          thumbColor={colors.onBrand}
        />
      </View>

      <View className="mt-8 flex-row gap-3">
        <View className="flex-1">
          <Button
            label={t("createListing.preview")}
            variant="secondary"
            onPress={() => setPreviewOpen(true)}
          />
        </View>
        <View className="flex-[2]">
          <Button
            label={isEdit ? t("createListing.saveChanges") : t("createListing.publish")}
            onPress={onSubmit}
            loading={isEdit ? updateListing.isPending : createListing.isPending}
            rightIcon={<PaperPlaneRight size={18} color={colors.onBrand} weight="fill" />}
          />
        </View>
      </View>

      <Modal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={t("createListing.preview")}
      >
        {previewListing ? (
          <ListingCard listing={previewListing} disableNavigation />
        ) : null}
      </Modal>

      <TimeRangePickerModal
        visible={timePickerOpen}
        fromHour={fromHour}
        toHour={toHour}
        onApply={(from, to) => {
          setFromHour(from);
          setToHour(to);
        }}
        onClose={() => setTimePickerOpen(false)}
      />
    </Screen>
  );
}
