const { required } = require("joi");
const { Schema, model } = require("mongoose");
const pavingSchema = new Schema(
  {
    productname: {
      type: String,
      required: [true, "A product must have a name"],
      unique: [true, "A product must have a unique name"],
      maxlenght: [50, "A product name cannot be longer than 50 characters"],
      minlenght: [3, "A product name cannot be shorter than 3 characters"],
    },
    type: {
      type: String,
      required: [true, "A product must have a type"],
      enum: ["paving", "curb"],
    },
    price: {
      type: String,
      required: [true, "A product must have a price"],
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
    },
    image: [],
    height: {
      type: String,
      required: [true, "A product must have a height"],
    },
    width: {
      type: String,
      required: [true, "A product must have a width"],
    },
    length: {
      type: String,
      required: [true, "A product must have a length"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Paving", pavingSchema);
