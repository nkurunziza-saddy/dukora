import type { Metadata } from "next";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import OnboardingFlow from "./_components/onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "onboarding",
  });
}

const page = () => {
  return <OnboardingFlow />;
};

export default page;
