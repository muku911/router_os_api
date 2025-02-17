const db = require("../config/db");
const response = require("../utils/response");
const datetime = require("../utils/datetime");
const mikrotik = require("../config/mikrotik");
const ipDhcpServerService = require("../services/mikrotik/ip-dhcp-server");
const ipFirewallService = require("../services/mikrotik/ip-firewall");
const monitoringDevicesModel = require("../services/database/monitoring-device");
const telegram = require("../utils/telegram");

// Monitoring Disconnected Devices
exports.getDisconnectedDevices = async () => {
  try {
    const startTime = process.hrtime();
    console.log("Checking Monitoring Devices...");
    const ccr = await mikrotik.connectRouter(mikrotik.router1);

    const monitoringDevices =
      await monitoringDevicesModel.getMonitoringDevices();
    const leasesData = await ipDhcpServerService.get(ccr, {
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

// Monitoring Hourly Bandwith Recap
exports.hourly = async (req, res) => {
  try {
    const result = await this.hourlyBandwithRecap();
    response.success(res, result.data, result.message);
  } catch (error) {
    response.error(res, error.message);
  }
};

exports.hourlyBandwithRecap = async () => {
  try {
    const startTime = process.hrtime();

    // connect to mikrotik
    const ccr = await mikrotik.connectRouter(mikrotik.router1);
    const lb = await mikrotik.connectRouter(mikrotik.router2);

    let tempArray = {};
    let tempID_CCR = [];
    let tempID_LB = [];
    // get by comment
    const arrayEtherName = [
      "download-ether1",
      "upload-ether1",
      "download-ether2",
      "upload-ether2",
      "download-ether3",
      "upload-ether3",
      "download-ether4",
      "upload-ether4",
    ];
    for (const value of arrayEtherName) {
      const args = {
        comment: value,
      };
      const dataCCR = await ipFirewallService.get(ccr, "filter", args);
      const dataLB = await ipFirewallService.get(lb, "filter", args);

      tempID_CCR.push(dataCCR[0].id);
      tempID_LB.push(dataLB[0].id);

      const total = dataLB[0].bytes / 1024 ** 3 + dataCCR[0].bytes / 1024 ** 3;
      tempArray[`${value}`] = total.toFixed(2);
    }

    // counting and insert data
    let totalDownloads = 0;
    let totalUploads = 0;
    const insertData = {};
    const downloadDataArray = [
      "download-ether1",
      "download-ether2",
      "download-ether3",
      "download-ether4",
    ];
    const uploadDataArray = [
      "upload-ether1",
      "upload-ether2",
      "upload-ether3",
      "upload-ether4",
    ];
    let ispNumber = 1;
    downloadDataArray.forEach((value) => {
      insertData[`isp${ispNumber}_download`] = parseFloat(tempArray[value]);
      totalDownloads += parseFloat(tempArray[value]);
      ispNumber++;
    });
    ispNumber = 1;
    uploadDataArray.forEach((value) => {
      insertData[`isp${ispNumber}_upload`] = parseFloat(tempArray[value]);
      totalUploads += parseFloat(tempArray[value]);
      ispNumber++;
    });
    insertData["total_download"] = totalDownloads.toFixed(2);
    insertData["total_upload"] = totalUploads.toFixed(2);
    insertData["date"] = datetime.currDate();
    insertData["created_at"] = datetime.currDatetime();
    await db("im_internet_used_hourly_logs").insert(insertData);

    // reset counter
    for (const value of tempID_CCR) {
      await ipFirewallService.resetCounter(ccr, "filter", {
        numbers: value,
      });
    }
    for (const value of tempID_LB) {
      await ipFirewallService.resetCounter(lb, "filter", {
        numbers: value,
      });
    }

    // Telegram Notification
    let sendMessage = `<b>Report - Internet Used (Hourly)</b>\n\n`;
    sendMessage += `Total Downloads : ${totalDownloads.toFixed(2)}GiB\n`;
    sendMessage += `Total Uploads : ${totalUploads.toFixed(2)}GiB\n\n`;
    sendMessage += `<b>-- ISP DETAILS --</b>\n`;
    sendMessage += `ISP 1 (200618) U/D: ${tempArray["upload-ether1"]}/${tempArray["download-ether1"]}GiB\n`;
    sendMessage += `ISP 2 (201548) U/D: ${tempArray["upload-ether2"]}/${tempArray["download-ether2"]}GiB\n`;
    sendMessage += `ISP 3 (201445) U/D: ${tempArray["upload-ether3"]}/${tempArray["download-ether3"]}GiB\n`;
    sendMessage += `ISP 4 (ICON+) U/D: ${tempArray["upload-ether4"]}/${tempArray["download-ether4"]}GiB\n\n`;
    sendMessage += `<em>#hourlyused #reportinternet #gigabit</em>`;

    telegram.sendTelegramMessageGroup(
      process.env.TOKEN_TELEGRAM_BOT,
      process.env.TELEGRAM_MONITORING_GROUP_ID,
      sendMessage,
      process.env.TELEGRAM_MONITORING_HOURLY_THREAD_ID
    );

    // Waktu selesai
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);

    const message = `Internet Used (Hourly) - Execution Time: ${executionTime} ms`;
    console.log(message);

    return {
      data: {
        executionTime: `${executionTime} ms`,
      },
      message: message,
    };
  } catch (error) {
    return {
      data: {},
      message: error.message,
    };
  } finally {
    mikrotik.disconnectRouter(mikrotik.router1);
    mikrotik.disconnectRouter(mikrotik.router2);
  }
};

// Monitoring Daily Bandwith Recap
exports.daily = async (req, res) => {
  try {
    const result = await this.dailyBandwithRecap();
    response.success(res, result.data, result.message);
  } catch (error) {
    response.error(res, error.message);
  }
};

exports.dailyBandwithRecap = async () => {
  try {
    const startTime = process.hrtime();

    const dateNow = datetime.currDate();
    const datetimeNow = datetime.currDatetime();
    const dateYesterday = datetime.yesterdayDate();

    let insertData = {};
    insertData["isp1_download"] = 0;
    insertData["isp2_download"] = 0;
    insertData["isp3_download"] = 0;
    insertData["isp4_download"] = 0;
    insertData["isp1_upload"] = 0;
    insertData["isp2_upload"] = 0;
    insertData["isp3_upload"] = 0;
    insertData["isp4_upload"] = 0;
    insertData["total_download"] = 0;
    insertData["total_upload"] = 0;

    // Get Data
    const getData = await db("im_internet_used_hourly_logs")
      .select("*")
      .where({ date: dateYesterday });

    getData.forEach((value) => {
      insertData["isp1_download"] += parseFloat(value.isp1_download);
      insertData["isp2_download"] += parseFloat(value.isp2_download);
      insertData["isp3_download"] += parseFloat(value.isp3_download);
      insertData["isp4_download"] += parseFloat(value.isp4_download);
      insertData["isp1_upload"] += parseFloat(value.isp1_upload);
      insertData["isp2_upload"] += parseFloat(value.isp2_upload);
      insertData["isp3_upload"] += parseFloat(value.isp3_upload);
      insertData["isp4_upload"] += parseFloat(value.isp4_upload);
      insertData["total_download"] += parseFloat(value.isp1_download);
      insertData["total_download"] += parseFloat(value.isp2_download);
      insertData["total_download"] += parseFloat(value.isp3_download);
      insertData["total_download"] += parseFloat(value.isp4_download);
      insertData["total_upload"] += parseFloat(value.isp1_upload);
      insertData["total_upload"] += parseFloat(value.isp2_upload);
      insertData["total_upload"] += parseFloat(value.isp3_upload);
      insertData["total_upload"] += parseFloat(value.isp4_upload);
    });

    insertData["isp1_download"] = parseFloat(
      insertData["isp1_download"]
    ).toFixed(2);
    insertData["isp2_download"] = parseFloat(
      insertData["isp2_download"]
    ).toFixed(2);
    insertData["isp3_download"] = parseFloat(
      insertData["isp3_download"]
    ).toFixed(2);
    insertData["isp4_download"] = parseFloat(
      insertData["isp4_download"]
    ).toFixed(2);
    insertData["isp1_upload"] = parseFloat(insertData["isp1_upload"]).toFixed(
      2
    );
    insertData["isp2_upload"] = parseFloat(insertData["isp2_upload"]).toFixed(
      2
    );
    insertData["isp3_upload"] = parseFloat(insertData["isp3_upload"]).toFixed(
      2
    );
    insertData["isp4_upload"] = parseFloat(insertData["isp4_upload"]).toFixed(
      2
    );
    insertData["total_download"] = parseFloat(
      insertData["total_download"]
    ).toFixed(2);
    insertData["total_download"] = parseFloat(
      insertData["total_download"]
    ).toFixed(2);
    insertData["total_download"] = parseFloat(
      insertData["total_download"]
    ).toFixed(2);
    insertData["total_download"] = parseFloat(
      insertData["total_download"]
    ).toFixed(2);
    insertData["total_upload"] = parseFloat(insertData["total_upload"]).toFixed(
      2
    );
    insertData["total_upload"] = parseFloat(insertData["total_upload"]).toFixed(
      2
    );
    insertData["total_upload"] = parseFloat(insertData["total_upload"]).toFixed(
      2
    );
    insertData["total_upload"] = parseFloat(insertData["total_upload"]).toFixed(
      2
    );
    insertData["date"] = dateYesterday;
    insertData["created_at"] = datetimeNow;

    await db("im_internet_used_daily_logs").insert(insertData);

    let sendMessage = `<b>Report - Internet Used (Daily)</b> \n\n`;
    sendMessage += `Total Downloads : ${insertData.total_download}GiB \n`;
    sendMessage += `Total Uploads : ${insertData.total_upload}GiB \n\n`;
    sendMessage += `<b>-- ISP DETAILS --</b> \n`;
    sendMessage += `ISP 1 (200618) U/D: ${insertData["isp1_upload"]}/${insertData["isp1_download"]}GiB\n`;
    sendMessage += `ISP 2 (201548) U/D: ${insertData["isp2_upload"]}/${insertData["isp2_download"]}GiB\n`;
    sendMessage += `ISP 3 (201445) U/D: ${insertData["isp3_upload"]}/${insertData["isp3_download"]}GiB\n`;
    sendMessage += `ISP 4 (ICON+) U/D: ${insertData["isp4_upload"]}/${insertData["isp4_download"]}GiB\n\n`;
    sendMessage += `<em>#dailyused  #reportinternet #gigabit</em>`;

    telegram.sendTelegramMessageGroup(
      process.env.TOKEN_TELEGRAM_BOT,
      process.env.TELEGRAM_MONITORING_GROUP_ID,
      sendMessage,
      process.env.TELEGRAM_MONITORING_DAILY_THREAD_ID
    );

    // Waktu selesai
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);

    const message = `Internet Used (Daily) - Execution Time: ${executionTime} ms`;
    console.log(message);
    return {
      data: {
        executionTime: `${executionTime} ms`,
      },
      message: message,
    };
  } catch (error) {
    return {
      data: {},
      message: error.message,
    };
  } finally {
  }
};
