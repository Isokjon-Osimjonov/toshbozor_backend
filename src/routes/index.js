const router = require("express").Router();

router.use("/product", require("./product.routes"));
router.use("/user", require("./user.routes"));

module.exports = router;
