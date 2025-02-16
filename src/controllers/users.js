const response = require("../utils/response");
// database
const usersModel = require("../services/database/users");

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const orderBy = req.query.orderBy || "name";
  const orderDir = req.query.orderDir || "asc";

  try {
    const result = await usersModel.getUsers(
      page,
      limit,
      search,
      orderBy,
      orderDir
    );
    response.success(res, result);
  } catch (error) {
    response.error(res, error.message);
  }
};
