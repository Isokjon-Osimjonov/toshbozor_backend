const { Router } = require("express");
const router = Router();

const {
  createProduct,
  uploadImages,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  getProductsByCategory,
} = require("../controllers/product.controllers");

const { protect, access } = require("../middleware/auth-protection.middleware");

// Routes for products
router
  .route("/")
  .post(protect, access("admin", "assistant"), uploadImages, createProduct)
  .get(getAllProducts)
  .delete(protect, access("admin"), deleteAllProducts);

router
  .route("/:id")
  .delete(protect, access("admin"), deleteProduct)
  .get(getProductById)
  .put(protect, access("admin", "assistant"), uploadImages, updateProduct);

router.route("/category/:category").get(getProductsByCategory);

module.exports = router;
