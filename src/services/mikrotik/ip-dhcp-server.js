exports.createLease = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip dhcp-server lease")
      .exec("add", args)
      .then((result) => {
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
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};

exports.getLeases = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip dhcp-server lease")
      .where(args)
      .get()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};
