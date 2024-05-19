const { Schema, model } = require("mongoose");

const wrokExamplesSchema = new Schema({
  image: {
    type: String,
    required: true,
  },
});

module.exports = model("WorkExamples", wrokExamplesSchema);
