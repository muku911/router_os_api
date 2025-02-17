const cron = require("node-cron");
const monitoringController = require("../controllers/monitoring");
const deviceController = require("../controllers/device");

cron.schedule("*/10 * * * *", async () => {
  const taskName = "Monitoring Devices";
  console.log("⏰ Running scheduled task:", taskName);
  try {
    await monitoringController.getDisconnectedDevices();
  } catch (error) {
    console.error("❌ Error running scheduled task:", taskName, error.message);
  } finally {
    console.log("✅ Scheduled task completed:", taskName);
  }
});

cron.schedule("* * * * *", async () => {
  const taskName = "Make Static Ip Address";
  console.log("⏰ Running scheduled task:", taskName);
  try {
    await deviceController.makeStatic();
  } catch (error) {
    console.error("❌ Error running scheduled task:", taskName, error.message);
  } finally {
    console.log("✅ Scheduled task completed:", taskName);
  }
});
