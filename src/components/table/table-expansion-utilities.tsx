import { useTranslations } from "next-intl";
import { RowExpansionConfig } from "./data-table";

export function createSimpleExpansion<TData>(
  contentKey: keyof TData
): RowExpansionConfig<TData> {
  return {
    enabled: true,
    contentKey,
  };
}

export function createCustomExpansion<TData>(
  canExpand: (row: TData) => boolean,
  renderContent: (row: TData) => React.ReactNode
): RowExpansionConfig<TData> {
  return {
    enabled: true,
    canExpand,
    renderContent,
  };
}

export function useObjectExpansion<TData>(
  contentKey: keyof TData,
  title?: string
): RowExpansionConfig<TData> {
  const t = useTranslations("table");
  return {
    enabled: true,
    contentKey,
    renderContent: (row: TData) => {
      const content = row[contentKey];
      if (!content) return null;

      return (
        <div className="p-4 bg-muted/30 rounded-lg">
          {title && (
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">
              {t(title)}
            </h4>
          )}
          <pre className="text-xs text-muted-foreground overflow-auto">
            {typeof content === "string"
              ? content
              : JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    },
  };
}

export function useTransactionExpansion<
  TData extends { note?: string; metadata?: string }
>(): RowExpansionConfig<TData> {
  const t = useTranslations("table");
  return {
    enabled: true,
    canExpand: (row) => Boolean(row.note || row.metadata),
    renderContent: (row) => (
      <div className="p-4 space-y-3">
        {row.note && (
          <div>
            <h4 className="font-medium text-sm mb-1 text-muted-foreground">
              {t("transaction.note")}
            </h4>
            <p className="text-sm">{row.note}</p>
          </div>
        )}
        {row.metadata && (
          <div>
            <h4 className="font-medium text-sm mb-1 text-muted-foreground">
              {t("transaction.metadata")}
            </h4>
            <pre className="text-xs text-muted-foreground bg-muted/30 p-2 rounded overflow-auto">
              {JSON.stringify(row.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    ),
  };
}

export function useProductExpansion<
  TData extends { description?: string; specifications?: string }
>(): RowExpansionConfig<TData> {
  const t = useTranslations("table");
  return {
    enabled: true,
    canExpand: (row) => Boolean(row.description || row.specifications),
    renderContent: (row) => (
      <div className="p-4 space-y-3">
        {row.description && (
          <div>
            <h4 className="font-medium text-sm mb-1 text-muted-foreground">
              {t("product.description")}
            </h4>
            <p className="text-sm">{row.description}</p>
          </div>
        )}
        {row.specifications && (
          <div>
            <h4 className="font-medium text-sm mb-1 text-muted-foreground">
              {t("product.specifications")}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(row.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {t(`product.specKey.${key}`)}:
                  </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  };
}
