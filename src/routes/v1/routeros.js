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
router.get("/device/new", verifyToken, deviceController.newDevice);
router.post("/device/remove", verifyToken, deviceController.newDevice);
// monitoring
router.get("/monitoring/device", verifyToken, monitoringController.devices);
router.get("/monitoring/hourly", verifyToken, monitoringController.hourly);
router.get("/monitoring/daily", verifyToken, monitoringController.daily);

module.exports = router;
