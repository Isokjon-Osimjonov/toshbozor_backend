const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 2117,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
};
