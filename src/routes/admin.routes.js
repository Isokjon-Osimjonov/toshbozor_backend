const { Router } = require("express");
const router = Router();

const {
  adminSignUp,
  adminSignIn,
  adminSignOut,
  forgotPassword,
  resetPassword,
} = require("../controllers/admin.controller");

router.post("/signup", adminSignUp);
router.post("/signin", adminSignIn);
router.post("/signout", adminSignOut);
router.post("/password_reset", forgotPassword);
router.patch("/password_reset/:token", resetPassword);

module.exports = router;
