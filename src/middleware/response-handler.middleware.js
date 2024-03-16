const jwt = require("jsonwebtoken");
const {
  signAccessToken,
  signRefreshToken,
} = require("../helpers/token.helpers");

const authResponseSender = async (data, statusCode, req, res) => {
  try {
    // Check if data is defined and contains required properties
    if (!data || !data._id || !data.username) {
      return res.status(500).json({ error: "Invalid data" });
    }

    // Sign access token
    const accessToken = await signAccessToken(data._id);

    // Sign refresh token
    const refreshToken = await signRefreshToken(data._id);
    // Remove password from data object
    data.password = undefined;
    // Send response with both tokens
    res.status(statusCode).json({
      status: "success",
      accessToken,
      refreshToken,
      data,
    });
  } catch (error) {
    console.error("Error in authResponseSender:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authResponseSender;
