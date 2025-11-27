"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const GotoStore = ({ businessId }: { businessId: string }) => {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        router.push(`/store/${businessId}`);
      }}
      size={"sm"}
      variant={"secondary"}
    >
      Goto store
    </Button>
  );
};

export default GotoStore;
