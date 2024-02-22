const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 2117,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
};
