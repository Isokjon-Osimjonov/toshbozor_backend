const router = require("express").Router();

router.use("/product", require("./product.routes"));
router.use("/user", require("./user.routes"));
router.use("/examples", require("./work.examples.routes"));

module.exports = router;
