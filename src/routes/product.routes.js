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

const {
  protect,
  adminAccess,
} = require("../middleware/auth-protection.middleware");

router.use("/:productType", validateProductTypeAndModel);

// Routes for products
router
  .route("/:productType")
  .post(protect, adminAccess, photoUpload, createProduct)
  .get(getAllProducts)
  .delete(protect, adminAccess, deleteAllProducts);

router
  .route("/:productType/:id")
  .get(getProductById)
  .put(protect, adminAccess, photoUpload, updateProduct)
  .delete(protect, adminAccess, deleteProduct);

module.exports = router;
