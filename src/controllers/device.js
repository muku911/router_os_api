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

exports.makeStatic = async () => {
  try {
    const startTime = process.hrtime();
    console.log("Making static ip address...");

    //  connect to mikrotik
    const ccr = await mikrotik.connectRouter(mikrotik.router1);

    // get dynamic ip address
    const leaseData = await ipDhcpServerService.getLeases(ccr, {
      server: "NFBS",
      dynamic: "true",
    });

    // get address list form firewall
    const addressLists = await ipFirewallService.getFirewalls(
      ccr,
      "address-list"
    );

    // get queue
    const simpleQue = await queueService.getQueue(ccr, {});

    // process
    for (let index = 0; index < leaseData.length; index++) {
      const lease = leaseData[index];
      console.log("Making Static Ip Address for ", lease);

      // delete previous rules address list
      const leaseAddressList = addressLists.filter(
        (item) => item.comment == `MAIN - ${lease.macAddress}`
      );
      for (
        let leaseAddressListIndex = 0;
        leaseAddressListIndex < leaseAddressList.length;
        leaseAddressListIndex++
      ) {
        const firewall = leaseAddressList[leaseAddressListIndex];
        console.log("DELETE ADDRESS LIST ", firewall.id);
        await ipFirewallService.delFirewall(ccr, firewall.id);
      }

      // delete previous rules simple queue
      const leaseSimpleQueue = simpleQue.filter(
        (item) => item.comment == `MAIN - ${lease.macAddress}`
      );
      for (
        let leaseSimpleQueueIndex = 0;
        leaseSimpleQueueIndex < leaseSimpleQueue.length;
        leaseSimpleQueueIndex++
      ) {
        const queue = leaseSimpleQueue[leaseSimpleQueueIndex];
        console.log("DELETE SIMPLE QUEUE ", queue.id);
        queueService.delQueue(ccr, queue.id);
      }

      // delete where in db
      console.log("DELETE WHEN IN DB ", lease.macAddress);
      await registeredDeviceModel.delete(lease.macAddress);

      // unregistered device role db
      const insertData = {
        mac_address: lease.macAddress,
        address: lease.address,
        hostname: "-",
        registered: "UNREGISTERED",
        im_bandwith_rule_id: 1,
        im_route_rule_id: 1,
        created_by: "SYSTEM",
        updated_by: "SYSTEM",
        created_at: datetime.currDatetime(),
        updated_at: datetime.currDatetime(),
      };

      // cek kalau di lease ada key hostName
      if (lease.hostName) {
        insertData.hostname = lease.hostName;
      }

      // arg mikrotik for static ip address
      const addLeaseData = {
        macAddress: lease.macAddress,
        clientId: lease.clientId,
        server: "NFBS",
        address: lease.address,
      };
      if (lease.clientId === undefined) {
        const newClientID = `1:${lease.macAddress}`;
        addLeaseData.clientId = newClientID.toLowerCase();
      }

      const addListAddress = {
        list: "GROUP-UNREGISTERED",
        address: lease.address,
        comment: `MAIN - ${lease.macAddress}`,
      };

      // get rule bandwith
      const bandwithRule = await bandwithRulesModel.getBandwithRulesByName(
        "UNREGISTERED"
      );
      const addSimpleQueData = {
        name: `MAIN - ${lease.macAddress}`,
        comment: `MAIN - ${lease.macAddress}`,
        parent: "LIMITASI-INTERNET",
        target: `${lease.address}/32`,
        limitAt: bandwithRule.limitAt,
        maxLimit: bandwithRule.maxLimit,
      };

      // add simple que
      await queueService.createQueue(ccr, addSimpleQueData);
      // add addresslist
      await ipFirewallService.createFirewall(
        ccr,
        "address-list",
        addListAddress
      );
      // Make Static IP
      await ipDhcpServerService.delLease(ccr, lease.id);
      await ipDhcpServerService.createLease(ccr, addLeaseData);
      // Insert DB
      await registeredDeviceModel.insert(insertData);
    }
    // end process

    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    const message = `Success make static ip address`;
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

exports.newDevice = async (req, res) => {
  try {
    const result = await this.makeStatic();
    response.success(res, result.data, result.message);
  } catch (error) {
    response.error(res, error.message);
  }
};
