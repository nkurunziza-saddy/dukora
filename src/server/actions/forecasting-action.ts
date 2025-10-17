import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { getUserIfHasPermission } from "./auth/permission-middleware";

function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n || 0;

  return { slope, intercept };
}

export interface ForecastPoint {
  x: number;
  y: number | null;
  name: string;
  forecast?: number;
}

export async function getForecastedMetrics(
  historicalData: Record<string, Record<string, number>>,
  metricName: string,
  forecastPeriods = 3,
) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const formattedData: ForecastPoint[] = Object.entries(historicalData).map(
      ([period, metrics], index) =>
        ({
          x: index,
          y: metrics[metricName] || 0,
          name: new Date(period).toLocaleString("default", { month: "short" }),
        }) as ForecastPoint,
    );

    if (formattedData.length < 2) {
      return { data: formattedData, error: null };
    }

    const regressionData = formattedData
      .filter((d) => d.y !== null)
      .map((d) => ({ x: d.x, y: d.y as number }));
    const { slope, intercept } = linearRegression(regressionData);

    const lastIndex = formattedData.length - 1;
    const lastPeriod = Object.keys(historicalData)[lastIndex];

    for (let i = 1; i <= forecastPeriods; i++) {
      const nextIndex = lastIndex + i;
      const forecastValue = slope * nextIndex + intercept;

      const nextPeriodDate = new Date(lastPeriod);
      nextPeriodDate.setMonth(nextPeriodDate.getMonth() + i);

      formattedData.push({
        x: nextIndex,
        y: null,
        name: nextPeriodDate.toLocaleString("default", { month: "short" }),
        forecast: forecastValue > 0 ? forecastValue : 0,
      });
    }

    const result = formattedData.map((d) => ({
      name: d.name,
      [metricName]: d.y,
      forecast: d.forecast,
    }));

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to calculate forecast:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
