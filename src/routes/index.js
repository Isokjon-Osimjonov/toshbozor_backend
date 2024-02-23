const router = require("express").Router();

router.use("/product", require("./product.routes"));
router.use("/admin", require("./admin.routes"));

module.exports = router;
