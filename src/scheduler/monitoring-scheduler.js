const cron = require("node-cron");
const monitoringController = require("../controllers/monitoring");
const deviceController = require("../controllers/device");
const resyncController = require("../controllers/resync");

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

cron.schedule("0 * * * *", async () => {
  const taskName = "Get Recap Bandwith - Hourly";
  console.log("⏰ Running scheduled task:", taskName);
  try {
    await monitoringController.hourlyBandwithRecap();
  } catch (error) {
    console.error("❌ Error running scheduled task:", taskName, error.message);
  } finally {
    console.log("✅ Scheduled task completed:", taskName);
  }
});

cron.schedule("0 0 * * *", async () => {
  const taskName = "Get Recap Bandwith - Daily";
  console.log("⏰ Running scheduled task:", taskName);
  try {
    await monitoringController.dailyBandwithRecap();
  } catch (error) {
    console.error("❌ Error running scheduled task:", taskName, error.message);
  } finally {
    console.log("✅ Scheduled task completed:", taskName);
  }
});

cron.schedule("0 0 * * *", async () => {
  const taskName = "Resync All Device";
  console.log("⏰ Running scheduled task:", taskName);
  try {
    await resyncController.start();
  } catch (error) {
    console.error("❌ Error running scheduled task:", taskName, error.message);
  } finally {
    console.log("✅ Scheduled task completed:", taskName);
  }
});
