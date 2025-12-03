import type { Metadata } from "next";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import OnboardingForm from "./_components/onboarding-form";
import { OnboardingErrorBoundary } from "./_components/onboarding-error-boundary";

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
