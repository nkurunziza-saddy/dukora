import type { Metadata } from "next";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { OnboardingErrorBoundary } from "@/components/onboarding/onboarding-error-boundary";
import OnboardingForm from "@/components/forms/onboarding-form";

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
