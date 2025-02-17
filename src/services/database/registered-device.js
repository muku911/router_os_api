const db = require("../../config/db");

// delete
exports.delete = async (macAddress) => {
  try {
    await db("im_monitoring_devices").where({ mac_address: macAddress }).del();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

// insert
exports.insert = async (data) => {
  try {
    await db("im_registered_devices").insert(data);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
