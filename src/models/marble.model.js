const { Schema, model } = require("mongoose");

const marbleSchema = new Schema(
  {
    productname: {
      type: String,
      required: [true, "A product must have a name"],
      unique: [true, "A product must have a unique name"],
      maxlenght: [50, "A product name cannot be longer than 50 characters"],
      minlenght: [3, "A product name cannot be shorter than 3 characters"],
    },
    price: {
      type: String,
      required: [true, "A product must have a price"],
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
    },
    size: {
      type: String,
      required: [true, "A product must have a size"],
    },
    image: {
      type: String,
      required: [true, "A product must have an image"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Marble", marbleSchema);
