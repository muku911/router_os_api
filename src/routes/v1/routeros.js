const express = require("express");
const router = express.Router();

const ipAddressController = require("../../controllers/ip-address");
const monitoringController = require("../../controllers/monitoring");

router.get("/", ipAddressController.hello);
router.get("/monitoring", monitoringController.devices);
router.get("/ip-address", ipAddressController.getIpAddress);

module.exports = router;
