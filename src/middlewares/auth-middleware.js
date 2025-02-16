const jwt = require("jsonwebtoken");
const response = require("../utils/response");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return response.error(res, "Invalid token!", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return response.error(res, "Invalid token!", 401);
  }
};

module.exports = verifyToken;
