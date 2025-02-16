const fs = require("fs");
const path = require("path");

module.exports = () => {
  const schedulerDir = path.join(__dirname);

  fs.readdirSync(schedulerDir).forEach((file) => {
    if (file !== "index.js" && file.endsWith(".js")) {
      const modulePath = path.join(schedulerDir, file);
      const module = require(modulePath);
      console.log(`load scheduler: ${file}`);
      // Cek apakah module adalah fungsi
      if (typeof module === "function") {
        console.log(`Menjalankan scheduler dari file: ${file}`);
        module(); // Jalankan fungsi scheduler
      }
    }
  });
};
