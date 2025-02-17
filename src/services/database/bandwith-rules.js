const db = require("../../config/db");

exports.getBandwithRulesByName = async (name) => {
  try {
    const bandwithRules = await db("im_bandwith_rules").where({ name }).first();
    return bandwithRules;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
