const productRepo = require("../repositories/product.repo");

const create = async (model, data) => {
  return await productRepo.create(model, data);
};

const getAll = async (model) => {
  return await productRepo.getAll(model);
};

const getById = async (model, id) => {
  return await productRepo.getById(model, id);
};

const update = async (model, id, data) => {
  return await productRepo.update(model, id, data);
};

const deleteProduct = async (model, id) => {
  return await productRepo.deleteProduct(model, id);
};

const deleteAllProducts = async (model) => {
  return await productRepo.deleteAll(model);
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteProduct,
  deleteAllProducts,
};
