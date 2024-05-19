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
  getProductsByCategory,
} = require("../controllers/product.controllers");

const { protect, access } = require("../middleware/auth-protection.middleware");

// Routes for products
router
  .route("/")
  .post(protect, access("admin", "assistant"), photoUpload, createProduct)
  .get(getAllProducts)
  .delete(protect, access("admin"), deleteAllProducts);

router
  .route("/:id")
  .delete(protect, access("admin"), deleteProduct)
  .get(getProductById)
  .put(protect, access("admin", "assistant"), photoUpload, updateProduct);

router.route("/category/:category").get(getProductsByCategory);

module.exports = router;
