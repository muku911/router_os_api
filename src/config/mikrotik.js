const { RouterOSClient } = require("routeros-client");

exports.router1 = new RouterOSClient({
  host: process.env.MIKROTIK1_HOST,
  user: process.env.MIKROTIK1_USER,
  password: process.env.MIKROTIK1_PASSWORD,
  port: process.env.MIKROTIK1_PORT,
  timeout: process.env.MIKROTIK1_TIMEOUT,
});

exports.router2 = new RouterOSClient({
  host: process.env.MIKROTIK2_HOST,
  user: process.env.MIKROTIK2_USER,
  password: process.env.MIKROTIK2_PASSWORD,
  port: process.env.MIKROTIK2_PORT,
  timeout: process.env.MIKROTIK2_TIMEOUT,
});

exports.connectRouter = (ROUTER) => {
  return new Promise((resolve, reject) => {
    ROUTER.connect()
      .then((client) => {
        // console.log("Connected to Mikrotik", ROUTER);
        resolve(client);
      })
      .catch((err) => {
        // Connection error
        console.log(err);
        reject(`Unable to Connect Mikrotik`, ROUTER);
      });
  });
};

exports.disconnectRouter = (ROUTER) => {
  //   console.log("Disconnected from Mikrotik", ROUTER);
  ROUTER.close();
};
