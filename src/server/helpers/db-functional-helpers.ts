import * as metricsRepo from "@/server/repos/metrics-repo";
import { ErrorCode } from "@/server/constants/errors";
import { calculateAllMetrics } from "@/server/helpers/accounting-formulas";

export async function syncMetricsToDatabase(
  businessId: string,
  date: Date,
  metrics: ReturnType<typeof calculateAllMetrics>
) {
  if (!businessId || !date || !metrics) {
    console.error("Invalid parameters provided for metrics sync");
    return { data: null, error: ErrorCode.BAD_REQUEST };
  }

  try {
    const results = [];
    const errors = [];

    const metricsToSync = Object.entries(metrics).filter(
      ([key]) => key !== "dataQuality"
    );

    for (const [metricName, value] of metricsToSync) {
      if (
        value === null ||
        value === undefined ||
        (typeof value === "number" && isNaN(value))
      ) {
        console.warn(`Skipping invalid metric ${metricName}: ${value}`);
        continue;
      }

      let stringValue: string;
      if (typeof value === "number") {
        stringValue = value.toString();
      } else if (typeof value === "string") {
        stringValue = value;
      } else {
        stringValue = JSON.stringify(value);
      }

      try {
        const result = await metricsRepo.upsert_metric({
          businessId,
          name: metricName,
          periodType: "monthly",
          period: date,
          value: stringValue,
        });

        if (result.error) {
          console.error(`Failed to sync metric ${metricName}:`, result.error);
          errors.push({ metric: metricName, error: result.error });
        } else {
          results.push({ metric: metricName, data: result.data });
        }
      } catch (metricError) {
        console.error(`Exception syncing metric ${metricName}:`, metricError);
        errors.push({ metric: metricName, error: metricError });
      }
    }

    if (results.length > 0) {
      return {
        data: {
          successful: results,
          failed: errors,
          summary: {
            total: metricsToSync.length,
            successful: results.length,
            failed: errors.length,
          },
        },
        error: errors.length > 0 ? ErrorCode.PARTIAL_SUCCESS : null,
      };
    }

    return { data: null, error: ErrorCode.DATABASE_ERROR };
  } catch (error) {
    console.error("Failed to sync metrics to database:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}
