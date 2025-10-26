import type { Metadata } from "next";
import OnTopBlurOverlay from "@/components/on-top-blur";
import { constructMetadata } from "@/lib/config/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Commerce",
});

const commerce = () => {
  return (
    <div>
      <OnTopBlurOverlay />
      commerce page with syncing stores and many more
    </div>
  );
};

export default commerce;
