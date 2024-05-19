const { Router } = require("express");
const router = Router();
const {
  uploadExampleImages,
  uploadImage,
  getWorkExamplesImages,
  deleteWorkExamplesImages,
  resizeImage,
} = require("../controllers/work.examples.contoller");

const { protect, access } = require("../middleware/auth-protection.middleware");

router.get("/images", getWorkExamplesImages);

router.use(protect);
router.post(
  "/upload",
  access("admin"),
  uploadImage,
  resizeImage,
  uploadExampleImages
);
router.delete("/delete/:id", access("admin"), deleteWorkExamplesImages);

module.exports = router;
