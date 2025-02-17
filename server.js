require("dotenv").config();
const ip = require("./src/utils/ip.js");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// utils
const response = require("./src/utils/response");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost";

// require("./src/scheduler")();

if (process.env.NODE_ENV === "production") {
  // hide log
  console.log = function () {};
  // activate Scheduler
  require("./src/scheduler")();
}

app.use(express.json());

// make route / as welcome message
app.get("/", (req, res) => {
  response.success(res, {
    ipAddress: ip.myIP(req),
  });
});

// Import Routes
const routes = require("./src/routes");
routes(app); // Auto load semua routes

// handle 404
app.use((req, res) => {
  response.success(res, {}, "Not Found", 404);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
