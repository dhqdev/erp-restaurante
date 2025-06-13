import { useState, useEffect } from "react";

export function useTrial(trialDaysLeft: number) {
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    if (trialDaysLeft <= 0) {
      setShowTrialModal(true);
    }
  }, [trialDaysLeft]);

  const closeTrialModal = () => {
    setShowTrialModal(false);
  };

  const redirectToPayment = () => {
    window.open("https://pay.cakto.com.br/fna8efe_427848", "_blank");
  };

  return {
    showTrialModal,
    closeTrialModal,
    redirectToPayment,
    isTrialExpired: trialDaysLeft <= 0,
  };
}
