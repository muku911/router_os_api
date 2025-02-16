const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/response");
const usersModel = require("../services/database/users");

// Fungsi untuk generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Login Controller
exports.login = async (req, res) => {
  const { username, password } = req.body;
  // cek username dan password tidak boleh kosong
  if (!username || !password) {
    return response.error(res, "Username or Password is Required!", 400);
  }

  try {
    const user = await usersModel.getUserByUsername(username);
    // Cek user
    if (!user) {
      return response.error(res, "Username or Password is Wrong!", 401);
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.error(res, "Username or Password is Wrong!", 401);
    }

    // Generate JWT
    const token = generateToken(user);

    response.success(
      res,
      {
        token: token,
      },
      "Login Success"
    );
  } catch (error) {
    response.error(res, error.message);
  }
};

// Login For System
exports.loginSystem = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return response.error(res, "Username or Password is Required!", 400);
  }

  try {
    // Cek password
    const isMatch = await bcrypt.compare(
      password,
      process.env.JWT_SYSTEM_BCRYPT
    );
    if (!isMatch) {
      return response.error(res, "Username or Password is Wrong!", 401);
    }

    // Generate JWT
    const user = {
      id: 74,
      username: "system",
      name: "System",
    };
    const token = generateToken(user);

    response.success(
      res,
      {
        token: token,
      },
      "Login Success"
    );
  } catch (error) {
    response.error(res, error.message);
  }
};
