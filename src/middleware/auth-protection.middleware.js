const { promisify } = require("util");
const { StatusCode } = require("../enums/status-code.enum");
const AppError = require("../utils/appError");
const { asyncWrapper } = require("../utils/asyncWrapper");
const User = require("../models/admin.model");
const {
  verifyToken,
  extractTokenFromHeaders,
  signAccessToken,
  verifyRefreshToken,
  extractRefreshToken,
} = require("../helpers/token.helpers");
// =================Acces protection middleware================================
const protect = asyncWrapper(async (req, res, next) => {
  //Getting token and check of it's here
  let token = await extractTokenFromHeaders(req);

  //Verifying token
  const decoded = await verifyToken(token);

  // Checking if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        "You are not logged in! Please log in to get access.",
        StatusCode.Unauthorized
      )
    );
  }

  //Cheking if user changed password after the token was issued
  if (user.isPasswordChanged(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed password! Please log in again.",
        StatusCode.Unauthorized
      )
    );
  }

  req.user = user;
  res.locals.user = user;
  next();
});

module.exports = protect;

//Grant user access middleware
// const userAccess = (req, res, next) => {
//   if (!req.user.isuser) {
//     return next(
//       new AppError(
//         "You are not allowed to perform this action",
//         StatusCode.Unauthorized
//       )
//     );
//   }
//   next();
// };

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
