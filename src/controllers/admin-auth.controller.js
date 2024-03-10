const adminService = require("../services/admin.services");
const { asyncWrapper } = require("../utils/asyncWrapper");
const { StatusCode } = require("../enums/status-code.enum");
const { SuccessCode } = require("../enums/success-code.enum");
const adminDataValidation = require("../validators/admin.validator");
const AppError = require("../utils/appError");
const responseHandler = require("../middleware/response-handler.middleware");
const { sendWelcomeEmail } = require("../utils/email");
const filterObj = require("../utils/filterObj.js");

// =================Admin sign up================================
// @desc: Admin sign up
// @route: POST /api/v1/admin/signup
// @access: private / Admin
const adminSignUp = asyncWrapper(async (req, res, next) => {
  const { fullName, username, password, email, passwordConfirm } = req.body;
  const url = "https://toshbozor.uz";
  // Validate admin data
  const validatedData = adminDataValidation.validateAdminData(req.body);

  // Check if required fields are present
  if (
    !validatedData.fullName ||
    !validatedData.username ||
    !validatedData.email ||
    !validatedData.password ||
    !validatedData.passwordConfirm
  ) {
    return next(
      new AppError("Please provide all required fields", StatusCode.BadRequest)
    );
  }

  const validData = {
    fullName: validatedData.fullName,
    username: validatedData.username,
    email: validatedData.email,
    password: validatedData.password,
    passwordConfirm: validatedData.passwordConfirm,
  };

  // Call service function to create admin
  const admin = await adminService.signUp(validData);

  // Send welcome email
  await sendWelcomeEmail(req.body, url);

  // Send response
  responseHandler(admin, StatusCode.Created, req, res);
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
  responseHandler(admin, StatusCode.Created, req, res);
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

  const newPassword = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  const data = await adminService.resetPassword(
    newPassword,
    passwordConfirm,
    token
  );
  console.log(data);
  responseHandler(data, StatusCode.Created, req, res);
});

// =================Admin update password================================
// @desc: Admin update password
// @route: POST /api/v1/admin/password_update/
// @access: private / Admin
const updatePassword = asyncWrapper(async (req, res, next) => {
  //Get user from database
  const id = req.user._id;

  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  const user = await adminService.updatePassword(
    id,
    password,
    passwordConfirm,
    req,
    res
  );

  //Send response
  responseHandler(user, StatusCode.Created, req, res);
});

// =================Admin update info================================
// @desc: Admin uupdate info
// @route: POST /api/v1/admin/password_update/
// @access: private / Admin

const updateInfo = asyncWrapper(async (req, res, next) => {
  const id = req.user._id;
  const user = await adminService.updateInfo(id, data);

  const data = filterObj(req.body, ["fullName", "username"]);
  if (req.file) data.avatar = req.file.filename;

  responseHandler(user, StatusCode.Created, req, res);
});

module.exports = {
  adminSignUp,
  adminSignIn,
  adminSignOut,
  forgotPassword,
  resetPassword,
  updatePassword,
  updatePassword,
  updateInfo,
};
