const adminModel = require("../models/admin.model");
const signUp = async (data) => {
  return await adminModel.create(data);
};

const findOne = async (username) => {
  return await adminModel.findOne(username);
};

module.exports = {
  signUp,
  findOne,
};
