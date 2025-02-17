exports.createArp = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip arp")
      .exec("add", args)
      .then((result) => {
        // console.log("/ip arp add", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.updateArp = (client, id, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip arp")
      .where("id", id)
      .update(args)
      .then((result) => {
        // console.log("/ip firewall address-list set", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.delArp = (client, numbers) => {
  return new Promise((resolve, reject) => {
    const args = {
      numbers: numbers,
    };
    client
      .menu("/ip arp")
      .exec("remove", args)
      .then((result) => {
        // console.log("/ip arp remove", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.getArp = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip arp")
      .where(args)
      .get()
      .then((result) => {
        // console.log("/ip arp", args);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};
