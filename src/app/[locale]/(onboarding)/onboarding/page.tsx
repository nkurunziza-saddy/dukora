import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import OnboardingFlow from "./_components/onboarding-form";

export const metadata: Metadata = constructMetadata({
  title: "Onboarding",
});

const page = () => {
  return <OnboardingFlow />;
};

export default page;