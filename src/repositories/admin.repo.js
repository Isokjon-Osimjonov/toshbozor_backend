const adminModel = require("../models/admin.model");
const signUp = async (data) => {
  return await adminModel.create(data);
};

const findOne = async (criteria) => {
  return await adminModel.findOne(criteria);
};
const findById = async (id) => {
  return await adminModel.findById(id);
};
const findByIdAndUpdate = async (id, data) => {
  return await adminModel.findByIdAndUpdate(id, data, {
    new: true,
    upsert: true,
  });
};

module.exports = {
  signUp,
  findOne,
  findById,
  findByIdAndUpdate,
};
