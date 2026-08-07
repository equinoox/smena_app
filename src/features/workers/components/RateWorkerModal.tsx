// RateWorkerModal — sheet for a venue owner to rate a worker on productivity,
// reliability, and quality (0-5 each). Opened from WorkerDetailScreen; prefills
// from the venue's existing rating of this worker, if any, so resubmitting edits it.
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@shared/components/Button";
import { Modal } from "@shared/components/Modal";
import { StarRatingInput } from "@shared/components/StarRatingInput";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useMyWorkerRating } from "@features/workers/hooks/useMyWorkerRating";
import { useSubmitWorkerRating } from "@features/workers/hooks/useSubmitWorkerRating";

type RateWorkerModalProps = {
  visible: boolean;
  onClose: () => void;
  workerId: string;
};

export function RateWorkerModal({
  visible,
  onClose,
  workerId,
}: RateWorkerModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: myRating } = useMyWorkerRating(workerId);
  const submit = useSubmitWorkerRating(workerId);

  const [productivity, setProductivity] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [quality, setQuality] = useState(0);

  // Re-seed from the venue's existing rating each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setProductivity(myRating?.productivity ?? 0);
    setReliability(myRating?.reliability ?? 0);
    setQuality(myRating?.quality ?? 0);
  }, [visible, myRating]);

  const onSubmit = async () => {
    await submit.mutateAsync({ productivity, reliability, quality });
    toast.success(t("rating.submitSuccess"));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t("rating.rateWorkerTitle")}
    >
      <View className="gap-5">
        <StarRatingInput
          label={t("rating.worker.productivity")}
          value={productivity}
          onChange={setProductivity}
        />
        <StarRatingInput
          label={t("rating.worker.reliability")}
          value={reliability}
          onChange={setReliability}
        />
        <StarRatingInput
          label={t("rating.worker.quality")}
          value={quality}
          onChange={setQuality}
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
