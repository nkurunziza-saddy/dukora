import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrderTimelineProps {
  status: string;
  fulfillmentStatus: string;
}

export function OrderTimeline({
  status,
  fulfillmentStatus,
}: OrderTimelineProps) {
  const t = useTranslations("store.orders");

  const steps = [
    { key: "PENDING", label: t("orderPlaced") },
    { key: "CONFIRMED", label: t("orderConfirmed") },
    { key: "PACKED", label: t("orderPacked") },
    { key: "SHIPPED", label: t("orderShipped") },
    { key: "DELIVERED", label: t("orderDelivered") },
  ];

  const statusIndex = steps.findIndex((s) => s.key === status);
  const fulfillmentIndex = steps.findIndex(
    (s) => s.key === fulfillmentStatus.toUpperCase(),
  );
  const currentIndex = Math.max(statusIndex, fulfillmentIndex);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div className="flex items-start gap-4" key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pt-1">
              <p
                className={`text-sm font-medium ${
                  isCurrent
                    ? "text-foreground"
                    : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
