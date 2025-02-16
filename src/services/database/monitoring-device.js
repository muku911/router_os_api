const db = require("../../config/db");

// Fungsi untuk GET semua data
exports.getMonitoringDevices = async () => {
  try {
    return await db("im_monitoring_devices as immd")
      .join(
        "im_registered_devices as imrd",
        "imrd.mac_address",
        "=",
        "immd.mac_address"
      )
      .select(
        "immd.mac_address as macAddress",
        "imrd.address",
        "immd.type",
        "immd.name",
        "immd.location",
        "immd.last_status"
      )
      .where({ status: true })
      .orderBy("immd.type", "asc")
      .orderBy("immd.location", "asc");
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

// update
exports.updateMonitoringDevice = async (macAddress, status) => {
  try {
    await db("im_monitoring_devices")
      .where({ mac_address: macAddress })
      .update({
        last_status: status === "bound" ? "connected" : "disconnected",
      });
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
