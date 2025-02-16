const db = require("../../config/db");

const allowedFields = ["name", "username", "gender", "category"];
const allowedOrderFields = ["name", "username", "gender", "category"]; // Field yang bisa di-order
const defaultOrderField = "name"; // Default urutkan berdasarkan nama
const defaultOrderDir = "asc"; // Default ascending

/**
 * Retrieves a paginated list of users from the database with optional search and sorting.
 *
 * @param {number} page - The page number to retrieve (default is 1).
 * @param {number} limit - The number of users per page (default is 10).
 * @param {string} search - A search term to filter users by name or username (default is "").
 * @param {string} orderBy - The field by which to order the results (default is "name").
 * @param {string} orderDir - The direction of sorting, either "asc" or "desc" (default is "asc").
 * @returns {Promise<Object>} A promise that resolves to an object containing a list of users and metadata.
 * @throws {Error} Throws an error if there is an issue retrieving the users.
 */

exports.getUsers = async (
  page = 1,
  limit = 10,
  search = "",
  orderBy = defaultOrderField,
  orderDir = defaultOrderDir
) => {
  try {
    // Hitung offset
    const offset = (page - 1) * limit;

    // Query dasar
    let query = db("users").select(allowedFields);

    // Kalau ada search, tambahkan WHERE LIKE
    if (search) {
      query.where((qb) => {
        qb.where("name", "like", `%${search}%`).orWhere(
          "username",
          "like",
          `%${search}%`
        );
      });
    }

    // Order By dan Direction
    if (allowedOrderFields.includes(orderBy)) {
      query.orderBy(orderBy, orderDir);
    }

    // Limit dan Offset (Pagination)
    query.limit(limit).offset(offset);

    // Eksekusi query
    const users = await query;

    // Hitung total data
    const [{ count }] = await db("users").count("id as count");

    return {
      data: users,
      meta: {
        total: parseInt(count),
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error saat mengambil data users:", error.message);
    throw error;
  }
};

/**
 * Retrieves a single user by ID.
 *
 * @param {number} id - The user ID to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the user object if found.
 * @throws {Error} Throws an error if there is an issue retrieving the user.
 */
exports.getUserById = async (id) => {
  try {
    const user = await db("users").select(allowedFields).where({ id }).first();
    return user;
  } catch (error) {
    console.error("Error saat mengambil data user by ID:", error.message);
    throw error;
  }
};

/**
 * Authenticates a user with the given username and password.
 *
 * @param {string} username - The username of the user attempting to log in.
 * @param {string} password - The password of the user attempting to log in.
 * @returns {Promise<Object|null>} A promise that resolves to the user object if authentication is successful, or null if it fails.
 * @throws {Error} Throws an error if there is an issue during the login process.
 */

exports.getUserByUsername = async (username) => {
  try {
    const user = await db("users").where({ username }).first();
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error saat login:", error.message);
    throw error;
  }
};
