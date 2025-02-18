const db = require("../../config/db");

// update
exports.update = async (args, data) => {
  try {
    await db("im_registered_devices").where(args).update(data);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

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

exports.getRegisteredDeviceWithBandwith = async () => {
  try {
    return await db("im_registered_devices as imrd")
      .join(
        "im_bandwith_rules as imbr",
        "imbr.id",
        "=",
        "imrd.im_bandwith_rule_id"
      )
      .join("im_route_rules as imrr", "imrr.id", "=", "imrd.im_route_rule_id")
      .select(
        "imrd.mac_address as macAddress",
        "imrd.address",
        "imbr.name as bandwithName",
        "imbr.limitAt",
        "imbr.maxLimit",
        "imrr.name as routeName"
      );
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
