const { promisify } = require("util");
const { StatusCode } = require("../enums/status-code.enum");
const AppError = require("../utils/appError");
const { asyncWrapper } = require("../utils/asyncWrapper");
const User = require("../models/user.model");
const {
  verifyToken,
  extractTokenFromHeaders,
  signAccessToken,
  verifyRefreshToken,
  extractRefreshToken,
} = require("../helpers/token.helpers");

// =================Acces protection middleware================================

const protect = asyncWrapper(async (req, res, next) => {
  // Extract access token from request headers
  const accessToken = await extractTokenFromHeaders(req);

  try {
    // Verify access token
    const decoded = await verifyToken(accessToken);

    // Check if user exists
    let user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User not found.", StatusCode.Unauthorized));
    }

    // Check if user's password has been changed
    if (user.isPasswordChanged(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          StatusCode.Unauthorized
        )
      );
    }

    req.user = user;

    return next();
  } catch (error) {
    // Handle token expiration
    if (error.name === "TokenExpiredError") {
      try {
        // Extract and verify refresh token
        const refreshToken = await extractRefreshToken(res, accessToken);
        const decodedUserId = await verifyRefreshToken(refreshToken);

        // Generate new access token
        const newAccessToken = await signAccessToken(decodedUserId);

        // Set new access token in response header
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);

        // Fetch user again using decoded user ID
        const user = await User.findById(decodedUserId);
        if (!user) {
          return next(new AppError("User not found.", StatusCode.Unauthorized));
        }

        req.user = user;

        return next();
      } catch (tokenRefreshingError) {
        return next(
          new AppError("Invalid refresh token.", StatusCode.Unauthorized)
        );
      }
    } else {
      return next(
        new AppError("Authentication failed.", StatusCode.Unauthorized)
      );
    }
  }
});

// =================Role based access================================
// @desc: role based acccess
const access = (...roles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!roles.includes(role)) {
      return next(
        new AppError(
          "You are not allowed to perform this action",
          StatusCode.Forbidden
        )
      );
    }

    next();
  };
};

module.exports = {
  protect,
  access,
};
