const AppError = require("../utils/appError.js");

const create = async (model, data) => {
  return model.create(data);
};

const getAll = async (model) => {
  const result = await model.find();
  if (result.length === 0) {
    return "No products found";
  } else {
    return result;
  }
};

const getById = async (model, id) => {
  const product = await model.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product.toObject();
};

const update = async (model, id, data) => {
  const updatedProduct = await model.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updatedProduct) {
    throw new AppError("Product not found", 404);
  }
  return updatedProduct;
};

const deleteProduct = async (model, id) => {
  const deletedProduct = await model.findByIdAndDelete(id);
  if (!deletedProduct) {
    throw new AppError("Product not found", 404);
  }
  return deletedProduct;
};

const deleteAll = async (model) => {
  return model.deleteMany();
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteProduct,
  deleteAll,
};
