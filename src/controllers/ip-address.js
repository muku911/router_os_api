const response = require("../utils/response");
// mikrotik
const mikrotik = require("../config/mikrotik");
const ipAddressService = require("../services/mikrotik/ip-address");

exports.hello = (req, res) => {
  response.success(res, {}, "Hello RouterOs API");
};

exports.getIpAddress = async (req, res) => {
  // req.query => to get query params
  try {
    const ccr = await mikrotik.connectRouter(mikrotik.router1);
    const getIpAddresses = await ipAddressService.getIpAddress(ccr);

    response.success(res, getIpAddresses);
  } catch (error) {
    response.error(res, error.message);
  } finally {
    mikrotik.disconnectRouter(mikrotik.router1);
  }
};
