const { Router } = require("express");
const router = Router();

const {
  adminSignUp,
  adminSignIn,
  adminSignOut,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/admin-auth.controller");
const { protect } = require("../middleware/auth-protection.middleware");

router.post("/signup", adminSignUp);
router.post("/signin", adminSignIn);

router.use(protect);

router.post("/signout", adminSignOut);
router.post("/password_reset", forgotPassword);
router.patch("/password_reset/:token", resetPassword);
router.patch("/password_update", updatePassword);

module.exports = router;
