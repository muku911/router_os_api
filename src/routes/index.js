const fs = require("fs");
const path = require("path");

module.exports = (app) => {
  const versionDir = path.join(__dirname);

  fs.readdirSync(versionDir).forEach((version) => {
    const versionPath = path.join(versionDir, version);
    if (fs.lstatSync(versionPath).isDirectory()) {
      fs.readdirSync(versionPath).forEach((file) => {
        const route = require(path.join(versionPath, file));
        const routeName = file.replace(".js", "");
        app.use(`/api/${version}/${routeName}`, route);
      });
    }
  });
};
