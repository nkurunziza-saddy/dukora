import type { Metadata } from "next";
import OnTopBlurOverlay from "@/components/on-top-blur";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "commerce",
  });
}

const commerce = () => {
  return (
    <div>
      <OnTopBlurOverlay />
      commerce page with syncing stores and many more
    </div>
  );
};

export default commerce;
