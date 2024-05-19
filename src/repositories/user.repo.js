const adminModel = require("../models/user.model");

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
  });
};

const updateOne = async (criteria, data) => {
  return await adminModel.findOneAndUpdate(criteria, data, {
    runValidators: true,
    validateBeforeSave: true,
    new: true,
  });
};

const aggregate = async (pipeline) => {
  return await adminModel.aggregate(pipeline);
};

module.exports = {
  create,
  findOne,
  find,
  deleteOne,
  findById,
  findByIdAndUpdate,
  updateOne,
  aggregate,
};
