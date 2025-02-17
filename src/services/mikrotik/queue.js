exports.create = (client, args) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/queue simple")
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
      .menu("/queue simple")
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
      .menu("/queue simple")
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
      .menu("/queue simple")
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
