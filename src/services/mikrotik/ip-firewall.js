exports.create = (client, sub, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu(`/ip firewall ${sub}`)
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

exports.update = (client, id, sub, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu(`/ip firewall ${sub}`)
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

exports.del = (client, sub, numbers) => {
  return new Promise((resolve, reject) => {
    const args = {
      numbers: numbers,
    };
    client
      .menu(`/ip firewall ${sub}`)
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

exports.get = (client, sub, args = {}) => {
  return new Promise((resolve, reject) => {
    client
      .menu(`/ip firewall ${sub}`)
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

exports.resetCounter = (client, sub, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu(`/ip firewall ${sub}`)
      .exec("reset-counters", args)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(`Command Error`);
      });
  });
};
