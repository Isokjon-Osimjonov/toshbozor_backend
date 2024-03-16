const adminModel = require("../models/admin.model");
const create = async (data) => {
  return await adminModel.create(data);
};

const findOne = async (criteria) => {
  return await adminModel.findOne(criteria);
};
const find = async (criteria) => {
  return await adminModel.find(criteria);
};
const deleteOne = async (criteria) => {
  return await adminModel.deleteOne(criteria);
};
const findById = async (id) => {
  return await adminModel.findById(id);
};
const findByIdAndUpdate = async (id, data) => {
  return await adminModel.findByIdAndUpdate(id, data, {
    runValidators: true,
    validateBeforeSave: true,
    new: true,
    upsert: true,
  });
};

module.exports = {
  create,
  findOne,
  find,
  deleteOne,
  findById,
  findByIdAndUpdate,
};
