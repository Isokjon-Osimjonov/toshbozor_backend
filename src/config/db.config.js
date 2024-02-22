const mongoose = require("mongoose");
const environments = require("./environments.config");

exports.databaseConnection = async () => {
  try {
    await mongoose.connect(environments.MONGODB_URI);
    console.log(`DB connected successfully 🔗`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
