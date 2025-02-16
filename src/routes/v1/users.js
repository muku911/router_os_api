const express = require("express");
const router = express.Router();

const verifyToken = require("../../middlewares/auth-middleware");
const usersController = require("../../controllers/users");

router.get("/", verifyToken, usersController.getUsers);

module.exports = router;
