const { Router } = require("express");
const router = Router();

const {
  signUp,
  signIn,
  signOut,
  verify,
  updateInfo,
  forgotPassword,
  resetPassword,
  updatePassword,
  uploadAvatar,
  addAssistant,
  newToken,
} = require("../controllers/user-auth.controller");

const requestLimiter = require("../utils/requestLimiter");
const { protect, access } = require("../middleware/auth-protection.middleware");

// routes
router.post("/signup", signUp);
router.post("/verify", requestLimiter, verify);
router.post("/signin", requestLimiter, signIn);

router.post("/token", newToken);
router.use(protect, );
router.post("/newassistant", access("admin"), addAssistant);
router.post("/signout", signOut);
router.patch("/update", uploadAvatar, updateInfo);
router.post("/password_reset", forgotPassword);
router.patch("/password_reset/:token", resetPassword);
router.patch("/password_update", updatePassword);

module.exports = router;
