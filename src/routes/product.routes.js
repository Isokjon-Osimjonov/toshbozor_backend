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
  .post(protect, access("admin", "assistant"), photoUpload, createProduct)
  .get(getAllProducts)
  .delete(protect, access("admin", "assistant"), deleteAllProducts);

router
  .route("/:productType/:id")
  .get(getProductById)
  .put(protect, access("admin", "assistant"), photoUpload, updateProduct)
  .delete(protect, access("admin"), deleteProduct);

module.exports = router;
