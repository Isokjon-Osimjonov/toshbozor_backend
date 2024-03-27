const { Router } = require("express");
const router = Router();

const {
  createProduct,
  photoUpload,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  validateProductTypeAndModel,
} = require("../controllers/product.controllers");

const { protect, access } = require("../middleware/auth-protection.middleware");

router.use("/:productType", validateProductTypeAndModel);

// Routes for products
router
  .route("/:productType")
  .post(protect, photoUpload, createProduct)
  .get(getAllProducts)
  .delete(protect, deleteAllProducts);

router
  .route("/:productType/:id")
  .delete(protect, access("admin"), deleteProduct)
  .get(getProductById)
  .put(protect, photoUpload, updateProduct);

module.exports = router;
