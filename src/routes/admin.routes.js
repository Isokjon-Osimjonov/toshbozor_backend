const { Router } = require("express");
const router = Router();

const {
  adminSignUp,
  adminSignIn,
  adminSignOut,
} = require("../controllers/admin.controller");

router.post("/signup", adminSignUp);
router.post("/signin", adminSignIn);
router.post("/signout", adminSignOut);

module.exports = router;
