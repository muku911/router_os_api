const requestIp = require("request-ip");

const myIP = (request) => {
  let detectedIp = requestIp.getClientIp(request);
  if (detectedIp === "::1") {
    detectedIp = "127.0.0.1";
  }
  return detectedIp.replace("::ffff:", "");
};

module.exports = { myIP };
