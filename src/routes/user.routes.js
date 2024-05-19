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
  toggleVisibility,
  updateEmail,
  verifyEmail,
} = require("../controllers/user-auth.controller");

const {
  addAssistant,
  manageAssistant,
  deleteAssistant,
  getUsers,
  getAllUsers,
} = require("../controllers/admin.controller");

const requestLimiter = require("../utils/requestLimiter");
const { protect, access } = require("../middleware/auth-protection.middleware");

// routes
router.post("/signup", signUp);
router.post("/verify", requestLimiter, verify);
router.post("/signin", requestLimiter, signIn);

router.use(protect);
router.post("/email_update", updateEmail);
router.post("/email_verify", verifyEmail);
router.post("/show_info", toggleVisibility);
router.get("/users", access("admin", "assistant"), getAllUsers);
router.post("/disable/:username", manageAssistant);
router.post("/delete/:username", deleteAssistant);
router.post("/newassistant", access("admin"), addAssistant);
router.post("/signout", signOut);
router.patch("/update", uploadAvatar, updateInfo);
router.post("/password_reset", forgotPassword);
router.patch("/password_reset/:token", resetPassword);
router.patch("/password_update", updatePassword);

module.exports = router;
