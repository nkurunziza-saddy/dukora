import * as metricsRepo from "@/server/repos/metrics-repo";
import { ErrorCode } from "@/server/constants/errors";
import { calculateAllMetrics } from "@/server/helpers/accounting-formulas";

export async function syncMetricsToDatabase(
  businessId: string,
  date: Date,
  metrics: ReturnType<typeof calculateAllMetrics>
) {
  try {
    const results = [];

    for (const [metricName, value] of Object.entries(metrics)) {
      const result = await metricsRepo.insert_metric({
        businessId,
        name: metricName,
        periodType: "monthly",
        period: date,
        value: value.toString(),
      });

      if (result.error) {
        console.error(`Failed to sync metric ${metricName}:`, result.error);
      } else {
        results.push(result.data);
      }
    }

    return { data: results, error: null };
  } catch (error) {
    console.error("Failed to sync metrics to database:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}
