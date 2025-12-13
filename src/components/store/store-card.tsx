import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SelectBusiness } from "@/lib/schema/schema.types";

const StoreCard = ({ business }: { business: SelectBusiness }) => {
  return (
    <div className="bg-background p-8 md:p-10 hover:bg-surface transition-colors group">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          {/* <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {business.logoUrl ? (
              <Image
                alt={business.name}
                className="h-full w-full object-cover"
                height={40}
                src={business.logoUrl}
                width={40}
              />
            ) : (
              <StoreIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div> */}
          <h3 className="text-base font-semibold text-foreground">
            <Link href={`/store/${business.id}`}>{business.name}</Link>
          </h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
          {business.description || "No description available."}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button
          render={<Link href={`/store/${business.id}`} />}
          size="sm"
          variant="outline"
        >
          Visit Store
        </Button>
      </div>
    </div>
  );
};

export default StoreCard;
