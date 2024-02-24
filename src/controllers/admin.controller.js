const adminService = require("../services/admin.services");
const { asyncWrapper } = require("../utils/asyncWrapper");
const { StatusCode } = require("../enums/status-code.enum");
const { SuccessCode } = require("../enums/success-code.enum");
const hashedPassword = require("../utils/hash-password");
const adminDataValidation = require("../validators/admin.validator");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const createSendToken = require("../middleware/token-generate.middleware");

// =================Admin sign up================================
// @desc: Admin sign up
// @route: POST /api/v1/admin/signup
// @access: private / Admin
const adminSignUp = asyncWrapper(async (req, res, next) => {
  const { username, email, password } = req.body;
  const url = "https://toshbozor.uz";
  // Validate admin data
  const validatedData = adminDataValidation.validateAdminData(req.body);

  // Check if required fields are present
  if (
    !validatedData.username ||
    !validatedData.email ||
    !validatedData.password
  ) {
    return next(
      new AppError("Please provide all required fields", StatusCode.BadRequest)
    );
  }

  const validData = {
    username: validatedData.username,
    email: validatedData.email,
    password: await hashedPassword(validatedData.password),
  };

  // Call service function to create admin
  const admin = await adminService.signUp(validData);
  await new Email(req.body, url).sendWelcome();

  // Send response
  createSendToken(admin, StatusCode.Created, req, res);
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

  createSendToken(admin, StatusCode.Created, req, res);
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

// =================Admin forgot password================================
// @desc: Admin log out
// @route: POST /api/v1/admin/password_reset
// @access: private / Admin
const forgotPassword = asyncWrapper(async (req, res, next) => {
  await adminService.forgotPassword(req.body.username, req);
  res.status(StatusCode.Ok).json({
    message: "Token sent to email!",
  });
});

// =================Admin reset password================================
// @desc: Admin reset password
// @route: POST /api/v1/admin/password_reset/:token
// @access: private / Admin
const resetPassword = asyncWrapper(async (req, res, next) => {
  const { token } = req.params;
  const data = await adminService.resetPassword(req.body.password, token);
  console.log(data)
  createSendToken(data, StatusCode.Created, req, res);
});

module.exports = {
  adminSignUp,
  adminSignIn,
  adminSignOut,
  forgotPassword,
  resetPassword,
};
