const response = require("../utils/response");
const mikrotik = require("../config/mikrotik");
const ipDhcpServerService = require("../services/mikrotik/ip-dhcp-server");
const monitoringDevicesModel = require("../services/database/monitoring-device");
const telegram = require("../utils/telegram");

exports.getDisconnectedDevices = async () => {
  try {
    const startTime = process.hrtime();
    console.log("Checking Monitoring Devices...");
    const ccr = await mikrotik.connectRouter(mikrotik.router1);

    const monitoringDevices =
      await monitoringDevicesModel.getMonitoringDevices();
    const leasesData = await ipDhcpServerService.getLeasesWith(ccr, {
      server: "NFBS",
      dynamic: "false",
    });

    let sumLastDisconnected = 0;
    let sumDisconnected = 0;
    let listDevices = ``;

    for (let index = 0; index < monitoringDevices.length; index++) {
      const device = monitoringDevices[index];
      const lease = leasesData.filter(
        (item) => item.macAddress === device.macAddress
      );
      const status = lease[0].status;
      const lastSeen = lease[0].lastSeen;

      if (device.lastStatus === "disconnected") {
        sumLastDisconnected += 1;
      }

      if (status !== "bound") {
        // problem at device
        sumDisconnected += 1;
        listDevices += `${sumDisconnected}. ${device.type} ${device.name} ${device.location}\nlastSeen : ${lastSeen}\n\n`;
        console.log(device.macAddress, status);
      }

      await monitoringDevicesModel.updateMonitoringDevice(
        device.macAddress,
        status
      );
    }

    let message = `<b>Report - Device Monitoring</b>\n`;
    message += `Disconnected Device (${sumDisconnected}) :\n`;
    message += `<b>-- LIST --</b> \n\n`;
    message += `${listDevices} \n`;

    let withTags = process.env.LOG_CC_HASHTAG;
    process.env.NODE_ENV === "development" && (withTags = "");
    const sendMessage = `${message}\n\n<em>#device #monitoring ${withTags}</em>`;
    if (sumDisconnected > 0) {
      telegram.sendTelegramMessageGroup(
        process.env.TOKEN_TELEGRAM_BOT,
        process.env.TELEGRAM_MONITORING_GROUP_ID,
        sendMessage,
        process.env.TELEGRAM_MONITORING_DEVICE_THREAD_ID
      );
    }

    // Waktu selesai
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);

    console.log(
      `Disconnected Device (${sumDisconnected}) - Execution Time: ${executionTime} ms`
    );

    return {
      data: {
        executionTime: `${executionTime} ms`,
      },
      message: `Disconnected Device (${sumDisconnected})`,
    };
  } catch (error) {
    return {
      data: {},
      message: error.message,
    };
  } finally {
    mikrotik.disconnectRouter(mikrotik.router1);
  }
};

exports.devices = async (req, res) => {
  try {
    const result = await this.getDisconnectedDevices();
    response.success(res, result.data, result.message);
  } catch (error) {
    response.error(res, error.message);
  }
};
