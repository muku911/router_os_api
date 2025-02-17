exports.create = (client, args) => {
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

exports.update = (client, id, args) => {
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

exports.del = (client, numbers) => {
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

exports.get = (client, args) => {
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
