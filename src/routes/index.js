const { Router } = require("express");

const router = Router();

router.use("/", require("./product.routes"));

module.exports = router;
