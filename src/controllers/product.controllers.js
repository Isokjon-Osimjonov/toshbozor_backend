const productService = require("../services/product.services.js");
const {
  asyncWrapper,
  asyncWrapperCreate,
} = require("../utils/asyncWrapper.js");
const upload = require("../utils/photoUpload.js");
const { StatusCode } = require("../enums/status-code.enum.js");
const { SuccessCode } = require("../enums/success-code.enum.js");

// Middleware for uploading product photo.
const photoUpload = upload.single("image");

// =================Create new product================================
// @desc: Create new product
// @route: POST /api/v1/product/:productType
// @access: private / Admin
const createProduct = asyncWrapperCreate(async (req, res, next) => {
  const productModel = req.productModel;

  const { productname, price, description, size } = req.body;
  const image = req.file
    ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    : "";
  const data = { productname, price, description, size, image };

  // Call service function to create product
  const result = await productService.create(productModel, data);

  // Send response
  res.status(StatusCode.Created).json({
    message: SuccessCode.ProductCreated,
    data: result,
  });
});

// =================Get all products================================
// @desc: Get all products
// @route: GET /api/v1/product/:productType
// @access: private / Admin
const getAllProducts = asyncWrapper(async (req, res, next) => {
  const productModel = req.productModel;
  // Call service function to get all products
  const result = await productService.getAll(productModel);

  // Send response
  res.status(StatusCode.Ok).json({
    message: SuccessCode.ProductsRetrieved,
    data: result,
  });
});

// =================Get product================================
// @desc: Get product
// @route: GET /api/v1/product/:productType/:id
// @access: private / Admin
const getProductById = asyncWrapper(async (req, res, next) => {
  const productModel = req.productModel;

  const { id } = req.params;
  // Call service function to get product by id
  const result = await productService.getById(productModel, id);

  // Send response
  res.status(StatusCode.Ok).json({
    message: SuccessCode.ProductRetrieved,
    data: result,
  });
});

// =================Update product================================
// @desc: Update product
// @route: PUT /api/v1/product/:productType/:id
// @access: private / Admin
const updateProduct = asyncWrapperCreate(async (req, res, next) => {
  const productModel = req.productModel;
  const { id } = req.params;
  const { productname, price, description, size } = req.body;
  const image = req.file
    ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    : "";
  const data = { productname, price, description, size, image };

  console.log(data);
  // Call service function to update product
  const result = await productService.update(productModel, id, data);

  // Send response
  res.status(StatusCode.Ok).json({
    message: SuccessCode.ProductUpdated,
    data: result,
  });
});

// =================Delete product================================
// @desc: Delete product
// @route: DELETE /api/v1/product/:productType/:id
// @access: private / Admin
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const productModel = req.productModel;

  const { id } = req.params;
  // Call service function to delete product
  const result = await productService.deleteProduct(productModel, id);

  // Send response
  res.status(StatusCode.Ok).json({
    message: SuccessCode.ProductDeleted,
    data: null,
  });
});

// =================Delete all product================================
// @desc: Delete all product
// @route: DELETE /api/v1/product/:productType
// @access: private / Admin
const deleteAllProducts = asyncWrapper(async (req, res, next) => {
  const productModel = req.productModel;

  // Call service function to delete all products
  const result = await productService.deleteAllProducts(productModel);

  // Send response
  res.status(StatusCode.NoContent).json({
    message: SuccessCode.ProductsDeleted,
    data: null,
  });
});

module.exports = {
  createProduct,
  photoUpload,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
};
