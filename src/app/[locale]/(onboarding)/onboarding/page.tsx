import type { Metadata } from "next";
import OnboardingForm from "@/components/forms/onboarding-form";
import { OnboardingErrorBoundary } from "@/components/onboarding/onboarding-error-boundary";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "onboarding",
  });
}

const page = () => {
  return (
    <OnboardingErrorBoundary>
      <OnboardingForm />
    </OnboardingErrorBoundary>
  );
};

export default page;
