/**
 * Get IP addresses from the Mikrotik router using the given client.
 * @param {Object} client - An instance of the RouterOS client.
 * @returns {Promise<Object[]>} A promise that resolves to an array of IP addresses on the router, or rejects with an error message.
 */
exports.getIpAddress = (client) => {
  return new Promise((resolve, reject) => {
    client
      .menu("/ip address")
      .get()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(`Command Error`);
      });
  });
};
