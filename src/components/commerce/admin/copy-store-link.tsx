"use client";
import { Button } from "@/components/ui/button";

const CopyStoreLink = ({ businessId }: { businessId: string }) => {
  return (
    <Button
      onClick={async () => {
        const storeLink = `${window.location.origin}/store/${businessId}`;
        await navigator.clipboard.writeText(storeLink);
      }}
    >
      Copy store link
    </Button>
  );
};

export default CopyStoreLink;
