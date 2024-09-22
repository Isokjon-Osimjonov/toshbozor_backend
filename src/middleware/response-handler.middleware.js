require("dotenv").config();

const {
  signAccessToken,
  signRefreshToken,
} = require("../helpers/token.helpers");
const parseDurationToSeconds = require("../utils/parseDurationToSeconds");

const authResponseSender = async (user, statusCode, res, req) => {
  try {
    if (!user || !user._id || !user.username) {
      return res.status(500).json({ error: "Invalid data" });
    }

    const accessTokenExpire =
      parseDurationToSeconds(process.env.ACCESS_TOKEN_EXPIRE) * 1000;
    const refreshTokenExpire =
      parseDurationToSeconds(process.env.REFRESH_TOKEN_EXPIRE) * 1000;

    // options for cookies
    const tokenOptions = (expiresIn) => ({
      expires: new Date(Date.now() + expiresIn),
      maxAge: expiresIn,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Sign access token
    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);

    // Remove password from data object
    user.password = undefined;

    res.cookie("access_token", accessToken, tokenOptions(accessTokenExpire));
    res.cookie("refresh_token", refreshToken, tokenOptions(refreshTokenExpire));

    res.status(statusCode).json({
      status: "success",
      accessToken,
      user,
    });
  } catch (error) {
    console.error("Error in authResponseSender:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authResponseSender;
