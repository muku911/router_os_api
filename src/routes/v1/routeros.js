const express = require("express");
const router = express.Router();

const verifyToken = require("../../middlewares/auth-middleware");

const ipAddressController = require("../../controllers/ip-address");
const monitoringController = require("../../controllers/monitoring");
const deviceController = require("../../controllers/device");

// ip address
router.get("/", verifyToken, ipAddressController.hello);
router.get("/ip-address", verifyToken, ipAddressController.getIpAddress);
// device
router.get("/new-device", verifyToken, deviceController.newDevice);
// monitoring
router.get("/monitoring", verifyToken, monitoringController.devices);
router.get("/hourly", verifyToken, monitoringController.hourly);
router.get("/daily", verifyToken, monitoringController.daily);

module.exports = router;
