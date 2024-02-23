const adminService = require("../services/admin.services");
const { asyncWrapper } = require("../utils/asyncWrapper");
const { StatusCode } = require("../enums/status-code.enum");
const { SuccessCode } = require("../enums/success-code.enum");
const hashedPassword = require("../utils/hash-password");
const adminDataValidation = require("../validators/admin.validator");
const AppError = require("../utils/appError");
const adminRepo = require("../repositories/admin.repo");
// =================Admin sign up================================
// @desc: Admin sign up
// @route: POST /api/v1/admin/signup
// @access: private / Admin
const adminSignUp = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  // Validate admin data
  const validateddata = adminDataValidation.validateAdminData(req.body);

  // Check if required fields are present
  if (!validateddata.username || !validateddata.password) {
    return next(
      new AppError("Please provide all required fields", StatusCode.BadRequest)
    );
  }
  const data = {
    username: validateddata.username,
    password: await hashedPassword(validateddata.password),
  };

  // Call service function to create admin
  const admin = await adminService.signUp(data);
  const token = admin.generateToken();

  // Send response
  res.status(StatusCode.Created).json({
    message: SuccessCode.SignedUp,
    data: admin,
    token,
  });
});

// =================Admin sign in================================
// @desc: Admin sign in
// @route: POST /api/v1/admin/signin
// @access: private / Admin
const adminSignIn = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  // Check if username and password present
  if (!username || !password) {
    return next(
      new AppError(
        "Please provide username and password",
        StatusCode.BadRequest
      )
    );
  }

  // Call service function to SignIn
  const admin = await adminService.signIn(username, password);
  const token = admin.generateToken();

  res.status(StatusCode.Ok).json({
    message: SuccessCode.SignedIn,
    data: admin,
    token,
  });
});

// =================Admin log out================================
// @desc: Admin log out
// @route: POST /api/v1/admin/signout
// @access: private / Admin
const adminSignOut = asyncWrapper(async (req, res, next) => {
  res.cookie("jwt", "signedout", {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  // Send response
  res.status(StatusCode.Ok).json({
    message: SuccessCode.SignedOut,
  });
});

module.exports = {
  adminSignUp,
  adminSignIn,
  adminSignOut,
};
