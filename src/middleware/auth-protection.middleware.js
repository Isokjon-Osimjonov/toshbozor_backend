const { promisify } = require("util");
const { StatusCode } = require("../enums/status-code.enum");
const AppError = require("../utils/appError");
const { asyncWrapper } = require("../utils/asyncWrapper");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

// =================Acces protection middleware================================
const protect = asyncWrapper(async (req, res, next) => {
  //Getting token and check of it's here
  let token;
  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  //Checking if token is there
  if (!token) {
    return next(
      new AppError(
        "You are not logged in! Please log in to get access.",
        StatusCode.Unauthorized
      )
    );
  }

  //Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Checking if user still exists
  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    return next(
      new AppError(
        "You are not logged in! Please log in to get access.",
        StatusCode.Unauthorized
      )
    );
  }

  //Cheking if user changed password after the token was issued
  if (admin.isPasswordChanged(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed password! Please log in again.",
        StatusCode.Unauthorized
      )
    );
  }

  req.user = admin;
  res.locals.admin = admin;
  next();
});

//Grant admin access middleware
const adminAccess = (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      new AppError(
        "You are not allowed to perform this action",
        StatusCode.Unauthorized
      )
    );
  }
  next();
};




module.exports = {
  protect,
  adminAccess,
};
