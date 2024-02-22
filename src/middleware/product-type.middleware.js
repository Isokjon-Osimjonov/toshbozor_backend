const validateProductTypeAndModel = (req, res, next) => {
  const { productType } = req.params;
  const allowedProductTypes = ["paving", "marble", "aglomerate"];

  if (!allowedProductTypes.includes(productType)) {
    return res
      .status(StatusCode.BadRequest)
      .json({ message: "Invalid product type" });
  }

  let model;
  switch (productType) {
    case "paving":
      model = require("../models/paving.model.js");
      break;
    case "marble":
      model = require("../models/marble.model.js");
      break;
    case "aglomerate":
      model = require("../models/aglomerate.model.js");
      break;
    default:
      return res
        .status(StatusCode.BadRequest)
        .json({ message: "Invalid product type" });
  }

  req.productModel = model; // Attach the model to the request object
  next();
};

module.exports = validateProductTypeAndModel;
