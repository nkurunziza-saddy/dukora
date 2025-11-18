import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CategoryCardProps {
  category: {
    id: string;
    value: string;
    description: string | null;
    productCount: number;
  };

  t: (key: string) => string;
}
const CategoryCard = ({ category, t }: CategoryCardProps) => {
  return (
    <div className="bg-background p-8 md:p-10 hover:bg-surface transition-colors group">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          <Link href={`/store/products/${category.id}`}>{category.value}</Link>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge variant="secondary">
          {category.productCount} {t("products")}
        </Badge>
        <Button
          render={<Link href={`/store/products?category=${category.value}`} />}
          size="xs"
          variant="outline"
        >
          {t("viewAll")}
        </Button>
      </div>
    </div>
  );
};

export default CategoryCard;
