const response = require("../utils/response");
const datetime = require("../utils/datetime");
// database
const registeredDeviceModel = require("../services/database/registered-device");
const bandwithRulesModel = require("../services/database/bandwith-rules");
// mikrotik
const mikrotik = require("../config/mikrotik");
const ipFirewallService = require("../services/mikrotik/ip-firewall");
const ipDhcpServerService = require("../services/mikrotik/ip-dhcp-server");
const queueService = require("../services/mikrotik/queue");

// 1. remove unused device
const removeUnusedDevice = async (ccr) => {
  try {
    const startTime = process.hrtime();
    console.log("Remove Unused Device...");

    const deleteDataArr = [];
    const regex = /(\d+)w/g;
    const leaseData = await ipDhcpServerService.get(ccr, {
      server: "NFBS",
    });

    const simpleQue = await queueService.get(ccr);
    const addressList = await ipFirewallService.get(ccr, "address-list");

    for (let index = 0; index < leaseData.length; index++) {
      const lease = leaseData[index];
      if (lease.lastSeen === "never") {
        // Jika last seen never lanjut aja, dan masukin ke delete array
        deleteDataArr.push(lease);
        continue;
      }
      const matches = [];
      let match;
      while ((match = regex.exec(lease.lastSeen)) !== null) {
        matches.push(match[1]); // Menambahkan nilai yang cocok ke dalam array
      }
      if (matches.length > 0 && matches[0] > 2) {
        // ketika sudah memasukin Week dan nilainya lebih dari 2
        deleteDataArr.push(lease);
      }
    }

    for (let index = 0; index < data.length; index++) {
      const lease = data[index];
      // Delete Address List
      const filteredAdList = addressList.filter(
        (item) => item.comment == `MAIN - ${lease.macAddress}`
      );
      for (let indexA = 0; indexA < filteredAdList.length; indexA++) {
        const firewall = filteredAdList[indexA];
        ipFirewallService.del(ccr, "address-list", firewall.id);
      }
      // Delete Simple Queue
      const filSimQueMain = simpleQue.filter(
        (item) => item.comment == `MAIN - ${lease.macAddress}`
      );
      for (let indexB = 0; indexB < filSimQueMain.length; indexB++) {
        const queue = filSimQueMain[indexB];
        queueService.del(ccr, queue.id);
      }
      // Delete on DB
      registeredDeviceModel.delete(lease.macAddress);
      ipDhcpServerService.del(ccr, lease.id);
    }

    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    const message = `Success, remove ${deleteDataArr.length} unused device`;
    console.log(message + " with execution time " + executionTime + " ms");
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
  }
};

// 2. re sync device
const reSyncDevice = async (ccr) => {
  try {
    const startTime = process.hrtime();
    console.log("Start re sync device...");

    const leaseData = await ipDhcpServerService.get(ccr, {
      server: "NFBS",
      dynamic: "false",
    });
    const simpleQue = await queueService.get(ccr);
    const addressList = await ipFirewallService.get(ccr, "address-list");

    // Delete All SimpleQue Client
    const filteredSimpleQue = simpleQue.filter(
      (item) => item.parent === "LIMITASI-INTERNET"
    );
    for (let index = 0; index < filteredSimpleQue.length; index++) {
      await queueService.del(ccr, filteredSimpleQue[index].id);
    }

    // Delete All Firewall Address List
    const addressListFiltered = addressList.filter(
      (item) => item.comment !== undefined && item.comment.includes("MAIN - ")
    );
    for (let index = 0; index < addressListFiltered.length; index++) {
      await ipFirewallService.del(
        ccr,
        "address-list",
        addressListFiltered[index].id
      );
    }

    // get data registered device
    const deviceDatas =
      await registeredDeviceModel.getRegisteredDeviceWithBandwith();

    // make rules again
    let number = 1;
    for (let index = 0; index < leaseData.length; index++) {
      const lease = leaseData[index];

      const rules = deviceDatas.filter(
        (item) => item.macAddress === lease.macAddress
      );
      console.log(`Data ${number} From ${leaseData.length}`, lease, rules);
      number++;

      await queueService.create(ccr, {
        name: `MAIN - ${lease.macAddress}`,
        comment: `MAIN - ${lease.macAddress}`,
        parent: "LIMITASI-INTERNET",
        target: `${lease.address}/32`,
        limitAt: rules[0].limitAt,
        maxLimit: rules[0].maxLimit,
      });

      await ipFirewallService.create(ccr, "address-list", {
        list: `GROUP-${rules[0].bandwithName}`,
        address: lease.address,
        comment: `MAIN - ${lease.macAddress}`,
      });

      if (rules[0].routeName !== "REGULER") {
        await ipFirewallService.create(ccr, "address-list", {
          list: `ROUTE-TO-${rules[0].routeName}`,
          address: lease.address,
          comment: `MAIN - ${lease.macAddress}`,
        });
      }

      if (rules[0].bandwithName === "STUDENT") {
        await ipFirewallService.create(ccr, "address-list", {
          list: "GROUP-STUDENT-INTERNET-DEFAULT",
          address: lease.address,
          comment: `MAIN - ${lease.macAddress}`,
        });
        await ipFirewallService.create(ccr, "address-list", {
          list: `GROUP-STUDENT-INTERNET-ON`,
          address: lease.address,
          comment: `MAIN - ${lease.macAddress}`,
        });
        await ipFirewallService.create(ccr, "address-list", {
          list: `GROUP-STUDENT-APPS-OFF`,
          address: lease.address,
          disabled: true,
          comment: `MAIN - ${lease.macAddress}`,
        });
      }
    }

    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    const message = `Success, re sync ${leaseData.length} device`;
    console.log(message + " with execution time " + executionTime + " ms");
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
  }
};

// 3. make chromebook rules
const chromebookRules = async (ccr) => {
  try {
    const startTime = process.hrtime();
    console.log("Start make chromebook rules...");

    const leaseData = await ipDhcpServerService.get(ccr, {
      server: "NFBS",
      dynamic: "false",
    });
    const simpleQue = await queueService.get(ccr);
    const addressList = await ipFirewallService.get(ccr, "address-list", {
      list: "CB_SISWA",
    });

    const chromebookData = leaseData.filter(
      (item) =>
        item.hostName !== undefined &&
        typeof item.hostName === "string" &&
        item.hostName.includes("cb-siswa")
    );

    // delete address list
    for (let index = 0; index < addressList.length; index++) {
      const firewall = addressList[index];
      await ipFirewallService.del(ccr, "address-list", firewall.id);
    }
    // delete simple queue
    for (let index = 0; index < data.length; index++) {
      const lease = data[index];
      const filSimQueMain = simpleQue.filter(
        (item) => item.comment == `MAIN - ${lease.macAddress}`
      );
      for (let indexB = 0; indexB < filSimQueMain.length; indexB++) {
        const queue = filSimQueMain[indexB];
        await queueService.del(ccr, queue.id);
      }
    }

    // Add Address List
    for (let index = 0; index < chromebookData.length; index++) {
      const lease = chromebookData[index];
      const addListAddress = {
        list: "CB_SISWA",
        address: lease.address,
        comment: `MAIN - ${lease.macAddress}`,
      };
      await ipFirewallService.create(ccr, "address-list", addListAddress);
    }

    // get rule bandwith
    const bandwithRule = await bandwithRulesModel.getBandwithRulesByName(
      "CHROMEBOOK"
    );

    // Set new rules for chromebook
    for (let index = 0; index < chromebookData.length; index++) {
      const lease = chromebookData[index];
      // Update Database
      await registeredDeviceModel.update(
        { address: lease.address },
        { im_bandwith_rule_id: 9, registered: "REGISTERED" }
      );
      // Add Simple Queue
      await queueService.create(CLIENT, {
        name: `MAIN - ${lease.macAddress}`,
        comment: `MAIN - ${lease.macAddress}`,
        parent: "LIMITASI-INTERNET",
        target: `${lease.address}/32`,
        limitAt: bandwithRule.limitAt,
        maxLimit: bandwithRule.maxLimit,
      });
    }

    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    const message = `Success, re sync ${chromebookData.length} chromebook`;
    console.log(message + " with execution time " + executionTime + " ms");
    return {
      data: {
        executionTime: `${executionTime} ms`,
      },
      message: message,
    };
  } catch (error) {
    return error;
  }
};

// exports
exports.start = async () => {
  try {
    const startTime = process.hrtime();
    console.log("Start resync...");

    //  connect to mikrotik
    const ccr = await mikrotik.connectRouter(mikrotik.router1);

    // remove unused device
    await removeUnusedDevice(ccr);

    // resync all device
    await reSyncDevice(ccr);

    // make chromebook rules
    await chromebookRules(ccr);

    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    const message = `Success, resync all device`;
    console.log(message + " with execution time " + executionTime + " ms");
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
  }
};
