import { scheduleMonthlyMetricsSync } from "@/server/actions/metrics-action";

async function syncAllBusinessMetrics() {
  try {
    await scheduleMonthlyMetricsSync();
  } catch (error) {
    console.error("Failed to sync monthly metrics:", error);
  }
}
if (require.main === module) {
  syncAllBusinessMetrics();
}

export { syncAllBusinessMetrics };
