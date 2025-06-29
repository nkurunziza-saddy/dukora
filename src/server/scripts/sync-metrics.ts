import { scheduleMonthlyMetricsSync } from "@/server/actions/metrics-action";
async function syncAllBusinessMetrics() {
  console.log("Starting monthly metrics sync...");

  try {
    const result = await scheduleMonthlyMetricsSync();

    console.log(
      `Metrics sync completed. Success: ${result.data?.successCount}, Errors: ${result.data?.errorCount}`
    );
  } catch (error) {
    console.error("Failed to sync monthly metrics:", error);
  }
}
if (require.main === module) {
  syncAllBusinessMetrics();
}

export { syncAllBusinessMetrics };
