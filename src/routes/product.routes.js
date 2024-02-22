const express = require("express");
const router = express.Router();

const {
  createProduct,
  photoUpload,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
} = require("../controllers/product.controllers");
const {
  validateProductTypeAndModel,
} = require("../middleware/product-type.middleware");

router.use("/:productType", validateProductTypeAndModel);

// Routes for products
router
  .route("/:productType")
  .post(photoUpload, createProduct)
  .get(getAllProducts)
  .delete(deleteAllProducts);

router
  .route("/:productType/:id")
  .get(getProductById)
  .put(photoUpload, updateProduct)
  .delete(deleteProduct);

module.exports = router;
