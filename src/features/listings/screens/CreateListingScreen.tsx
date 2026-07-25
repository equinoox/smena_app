// CreateListingScreen — venue "post a shift" form: position, title, employment type,
// date/shift time, optional pay, description, custom requirement tags, urgent toggle.
// Also doubles as the "edit listing" form: an `id` search param switches it into edit
// mode, prefilling from the existing listing and updating instead of creating.
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Briefcase,
  CalendarBlank,
  Check,
  Clock,
  Lightning,
  PaperPlaneRight,
  Plus,
  Wallet,
  X,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Switch, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ControlledInput } from "@shared/components/ControlledInput";
import { Input } from "@shared/components/Input";
import { Loader } from "@shared/components/Loader";
import { Modal } from "@shared/components/Modal";
import { Screen } from "@shared/components/Screen";
import { ListingCard } from "@shared/components/ListingCard";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
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
import {
  DatePickerModal,
  formatShortDate,
} from "@features/listings/components/DatePickerModal";
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

// No explicit pay-period selector in the design — infer a sensible default from
// employment type (a one-off fill-in is priced per shift, a permanent role per month).
const DEFAULT_PAY_PERIOD: Record<EmploymentType, PayPeriod> = {
  fill_in: "shift",
  part_time: "hour",
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
  const { venue } = useMyVenue();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!editId;
  const existingListing = useListing(editId ?? "");
  const createListing = useCreateListing(venue?.id);
  const updateListing = useUpdateListing(venue?.id);

  const [date, setDate] = useState<Date | null>(null);
  const [fromHour, setFromHour] = useState<number | null>(null);
  const [toHour, setToHour] = useState<number | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [addingRequirement, setAddingRequirement] = useState(false);
  const [requirementDraft, setRequirementDraft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      roleNeeded: "waiter",
      title: "",
      employmentType: "fill_in",
      payAmount: "",
      description: "",
    },
  });

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
    if (existing.starts_at) {
      const start = new Date(existing.starts_at);
      setDate(start);
      setFromHour(start.getHours());
    }
    if (existing.ends_at) {
      setToHour(new Date(existing.ends_at).getHours());
    }
    // Only ever prefill from the fetched row itself, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingListing.data, isEdit]);

  const employmentType = watch("employmentType");
  const payPeriod = DEFAULT_PAY_PERIOD[employmentType];

  const commitRequirement = () => {
    const value = requirementDraft.trim();
    if (value) setRequirements((prev) => [...prev, value]);
    setRequirementDraft("");
    setAddingRequirement(false);
  };

  const onSubmit = handleSubmit((values) => {
    if (!venue?.id) return;
    if (!date || fromHour === null || toHour === null) {
      toast.error(t("validation.required"));
      return;
    }
    const startsAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      fromHour,
    ).toISOString();
    const endsAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      toHour,
    ).toISOString();

    const input = {
      title: values.title,
      roleNeeded: values.roleNeeded,
      employmentType: values.employmentType,
      description: values.description || undefined,
      payAmount: values.payAmount ? Number(values.payAmount) : undefined,
      payPeriod,
      startsAt,
      endsAt,
      isUrgent,
      requirements,
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
      { ...input, venueId: venue.id },
      {
        onSuccess: () => {
          toast.success(t("createListing.publishSuccess"));
          router.back();
        },
      },
    );
  });

  const previewListing: ListingWithVenue | null = venue
    ? {
        id: "preview",
        venue_id: venue.id,
        title: watch("title"),
        role_needed: watch("roleNeeded"),
        employment_type: employmentType,
        description: watch("description") || null,
        pay_amount: watch("payAmount") ? Number(watch("payAmount")) : null,
        pay_period: payPeriod,
        currency: "RSD",
        starts_at:
          date && fromHour !== null
            ? new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                fromHour,
              ).toISOString()
            : null,
        ends_at:
          date && toHour !== null
            ? new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                toHour,
              ).toISOString()
            : null,
        is_urgent: isUrgent,
        status: "open",
        requirements,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString(),
        venue: {
          id: venue.id,
          name: venue.name,
          venue_type: venue.venue_type,
          city: venue.city,
          logo_url: venue.logo_url,
          lat: venue.lat,
          lng: venue.lng,
          phone: venue.phone,
        },
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

      <View className="mt-4 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.positionQuestion")}
        </Text>
        <Controller
          control={control}
          name="roleNeeded"
          render={({ field }) => (
            <View className="flex-row flex-wrap gap-2">
              {WORKER_ROLES.map((role) => (
                <Chip
                  key={role}
                  label={t(`roles.${role}` as TranslationKey)}
                  variant={field.value === role ? "active" : "neutral"}
                  size="lg"
                  onPress={() => field.onChange(role)}
                />
              ))}
            </View>
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
              {EMPLOYMENT_TYPES.map(({ value, icon: Icon }) => {
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
                        "font-sans-semibold text-sm",
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
      </View>

      <View className="mt-5 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.dateAndShift")}
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            className="h-12 flex-1 flex-row items-center gap-2 rounded-input border border-border-default bg-bg-surface px-3"
          >
            <CalendarBlank size={18} color={colors.textMuted} />
            <Text className="font-sans-semibold text-base text-text-primary">
              {date ? formatShortDate(date, language) : t("createListing.selectDate")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTimePickerOpen(true)}
            className="h-12 flex-1 flex-row items-center gap-2 rounded-input border border-border-default bg-bg-surface px-3"
          >
            <Clock size={18} color={colors.textMuted} />
            <Text className="font-sans-semibold text-base text-text-primary">
              {fromHour !== null && toHour !== null
                ? `${formatHour(fromHour, language)} - ${formatHour(toHour, language)}`
                : t("createListing.selectTime")}
            </Text>
          </Pressable>
        </View>
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
          numberOfLines={3}
        />
      </View>

      <View className="mt-5 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("createListing.requirementsLabel")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {requirements.map((req) => (
            <Chip
              key={req}
              label={req}
              variant="active"
              leftIcon={<Check size={13} weight="bold" color={colors.onBrand} />}
              onPress={() =>
                setRequirements((prev) => prev.filter((r) => r !== req))
              }
            />
          ))}
          {!addingRequirement ? (
            <Chip
              label={t("createListing.addRequirement")}
              variant="neutral"
              leftIcon={<Plus size={13} weight="bold" color={colors.textMuted} />}
              onPress={() => setAddingRequirement(true)}
            />
          ) : null}
        </View>
        {addingRequirement ? (
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                value={requirementDraft}
                onChangeText={setRequirementDraft}
                placeholder={t("createListing.requirementPlaceholder")}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={commitRequirement}
              />
            </View>
            <Pressable
              onPress={commitRequirement}
              className="h-12 w-12 items-center justify-center rounded-input bg-brand"
            >
              <Check size={20} weight="bold" color={colors.onBrand} />
            </Pressable>
          </View>
        ) : null}
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

      <DatePickerModal
        visible={datePickerOpen}
        value={date}
        onSelect={setDate}
        onClose={() => setDatePickerOpen(false)}
      />
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
