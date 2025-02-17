const express = require("express");
const router = express.Router();

const verifyToken = require("../../middlewares/auth-middleware");

const ipAddressController = require("../../controllers/ip-address");
const monitoringController = require("../../controllers/monitoring");
const deviceController = require("../../controllers/device");

router.get("/", verifyToken, ipAddressController.hello);
router.get("/ip-address", verifyToken, ipAddressController.getIpAddress);
router.get("/new-device", verifyToken, deviceController.newDevice);
router.get("/monitoring", verifyToken, monitoringController.devices);

module.exports = router;
