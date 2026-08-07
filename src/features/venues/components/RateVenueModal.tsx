// RateVenueModal — sheet for a worker to rate a venue on working conditions,
// atmosphere, and benefits (0-5 each). Opened from VenueDetailScreen; prefills
// from the worker's existing rating of this venue, if any, so resubmitting edits it.
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@shared/components/Button";
import { Modal } from "@shared/components/Modal";
import { StarRatingInput } from "@shared/components/StarRatingInput";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useMyVenueRating } from "@features/venues/hooks/useMyVenueRating";
import { useSubmitVenueRating } from "@features/venues/hooks/useSubmitVenueRating";

type RateVenueModalProps = {
  visible: boolean;
  onClose: () => void;
  venueId: string;
};

export function RateVenueModal({
  visible,
  onClose,
  venueId,
}: RateVenueModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: myRating } = useMyVenueRating(venueId);
  const submit = useSubmitVenueRating(venueId);

  const [conditions, setConditions] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [benefits, setBenefits] = useState(0);

  // Re-seed from the worker's existing rating each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setConditions(myRating?.conditions ?? 0);
    setAtmosphere(myRating?.atmosphere ?? 0);
    setBenefits(myRating?.benefits ?? 0);
  }, [visible, myRating]);

  const onSubmit = async () => {
    await submit.mutateAsync({ conditions, atmosphere, benefits });
    toast.success(t("rating.submitSuccess"));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t("rating.rateVenueTitle")}
    >
      <View className="gap-5">
        <StarRatingInput
          label={t("rating.venue.conditions")}
          value={conditions}
          onChange={setConditions}
        />
        <StarRatingInput
          label={t("rating.venue.atmosphere")}
          value={atmosphere}
          onChange={setAtmosphere}
        />
        <StarRatingInput
          label={t("rating.venue.benefits")}
          value={benefits}
          onChange={setBenefits}
        />
        <Button
          label={t("rating.submit")}
          onPress={onSubmit}
          loading={submit.isPending}
        />
      </View>
    </Modal>
  );
}
