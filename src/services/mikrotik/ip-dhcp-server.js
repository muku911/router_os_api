exports.createLease = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip dhcp-server lease")
      .exec("add", args)
      .then((result) => {
        // console.log("/ip dhcp-server lease add", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.updateLease = (client, id, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip dhcp-server lease")
      .where("id", id)
      .update(args)
      .then((result) => {
        console.log("/ip firewall address-list set", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.delLease = (client, numbers) => {
  return new Promise((resolve, reject) => {
    const args = {
      numbers: numbers,
    };
    client
      .menu("/ip dhcp-server lease")
      .exec("remove", args)
      .then((result) => {
        // console.log("/ip dhcp-server lease remove", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.getLeases = () => {
  return new Promise((resolve, reject) => {
    ccrAPI
      .connect()
      .then((client) => {
        const args = {
          server: "NFBS",
        };
        client
          .menu("/ip dhcp-server lease")
          .where(args)
          .get()
          .then((result) => {
            ccrAPI.close();
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        // Connection error
        console.log(err);
        reject(`Unable to Connect Mikrotik API`);
      });
  });
};

exports.getLeasesWith = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip dhcp-server lease")
      .where(args)
      .get()
      .then((result) => {
        console.log("/ip dhcp-server lease", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};
