import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { constructMetadata } from "@/lib/config/metadata";
import OnboardingFlow from "./_components/onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return constructMetadata({
    title: t("title"),
  });
}

const page = () => {
  return <OnboardingFlow />;
};

export default page;
