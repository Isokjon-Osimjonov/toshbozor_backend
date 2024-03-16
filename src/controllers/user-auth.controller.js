const userService = require("../services/user.services.js");
const { asyncWrapper } = require("../utils/asyncWrapper.js");
const { StatusCode } = require("../enums/status-code.enum.js");
const { SuccessCode } = require("../enums/success-code.enum.js");
const adminDataValidation = require("../validators/admin.validator.js");
const AppError = require("../utils/appError.js");
const authResponseSender = require("../middleware/response-handler.middleware.js");
const filterObj = require("../utils/filterObj.js");
const userRepo = require("../repositories/user.repo");
const photoUpload = require("../utils/photoUpload.js");
const { verifyRefreshToken } = require("../helpers/token.helpers.js");

//Executing this function will remove all users that are not verified
//this function runs when singUp-post method is made
// @desc: Remove all users that are not verified
let removeUnverifiedUsersTimeout = null;
const removeUnverifiedUsers = async () => {
  const unverifiedUsers = await userRepo.find({
    isVerified: false,
    createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) }, // Find users created more than 10 minutes ago
  });

  for (const user of unverifiedUsers) {
    await userRepo.deleteOne({ _id: user._id });
    console.log(`Unverified user ${user.username} removed from the database.`);
  }
};

// =================User upload avatar middleware
const uploadAvatar = photoUpload.single("avatar");

// =================Admin sign up================================
// @desc: User sign up
// @route: POST /api/v1/user/signup
// @access: private / Admin only accessable for admins
const signUp = asyncWrapper(async (req, res, next) => {
  const { fullName, username, password, email, passwordConfirm } = req.body;

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
  await userService.signUp(validData);

  // Send response
  res.status(StatusCode.Pending).json({
    status: SuccessCode.Pending,
    message: "OTP send to your email please check your inbox",
  });

  // Schedule the removal of unverified users after 10 minutes if not already scheduled
  if (!removeUnverifiedUsersTimeout) {
    removeUnverifiedUsersTimeout = setTimeout(async () => {
      try {
        console.log("Removing unverified users...");
        await removeUnverifiedUsers();
        console.log("Unverified users removed successfully.");
      } catch (error) {
        console.error("Error removing unverified users:", error);
      } finally {
        removeUnverifiedUsersTimeout = null; // Reset the timeout flag
      }
    }, 10 * 60 * 1000); // 10 minutes delay
  }
});

// =================Admin verify================================
// @desc: User verify
// @route: POST /api/v1/user/verify
// @access: for  users=(admins)
const verify = asyncWrapper(async (req, res, next) => {
  const { otp } = req.body;

  // Check if otp is present
  if (!otp) {
    return next(new AppError("Please provide OTP", StatusCode.BadRequest));
  }

  // Call service function to SignIn
  const user = await userService.verify(otp);

  //Sending response with user data
  authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin sign in================================
// @desc: User sign in
// @route: POST /api/v1/user/signin
// @access: private / Admin
const signIn = asyncWrapper(async (req, res, next) => {
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
  const user = await userService.signIn(username, password, req, res);

  console.log("SignIn=======", req.headers);

  //Sending response with user data
  await authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin log out================================
// @desc: User log out
// @route: POST /api/v1/user/signout
// @access: private / Admin
const signOut = (req, res) => {
  //Assigning token to null
  // res.cookie("jwt", "signedout", {
  //   expires: new Date(Date.now() + 1000),
  //   httpOnly: true,
  // });
  res.clearCookie("refreshToken");

  // Send response
  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
};

// =================Admin forgot password================================
// @desc: User log out
// @route: POST /api/v1/user/password_reset
// @access: private / Admin
const forgotPassword = asyncWrapper(async (req, res, next) => {
  // Call service function to forgot password
  await userService.forgotPassword(req.body.username, req);

  // Send response
  res.status(StatusCode.Ok).json({
    message: "Token sent to email!",
  });
});

// =================Admin reset password================================
// @desc: User reset password
// @route: POST /api/v1/admin/password_reset/:token
// @access: private / Admin
const resetPassword = asyncWrapper(async (req, res, next) => {
  const { token } = req.params;

  //Assigning fileds to data from body
  const newPassword = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  // Call service function to reset password
  const data = await userService.resetPassword(
    newPassword,
    passwordConfirm,
    token
  );

  //Sending response with user data
  authResponseSender(data, StatusCode.Ok, req, res);
});

// =================Admin update password================================
// @desc: User update password
// @route: POST /api/v1/user/password_update/
// @access: private / Admin
const updatePassword = asyncWrapper(async (req, res, next) => {
  //Get user from database
  const id = req.user._id;

  //Assigning fileds to data from body
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  // Call service function to update password
  const user = await userService.updatePassword(
    id,
    password,
    passwordConfirm,
    req,
    res
  );

  //Sending response with user data
  authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin update info================================
// @desc: User update info
// @route: POST /api/v1/user/password_update/
// @access: private / Admin
const updateInfo = asyncWrapper(async (req, res, next) => {
  //Get user from req.user
  const id = req.user._id;

  //Defining fileds to update
  const dataToUpdate = filterObj(req.body, "fullName", "username");

  // Validate the data before updating
  const validatedData =
    adminDataValidation.validateAdminDataForUpdate(dataToUpdate);

  // Check if there's a file in the request and update the avatar field accordingly
  if (req.file) {
    validatedData.avatar = req.file.filename;
  }

  //Call service function to update info
  const user = await userService.updateInfo(id, validatedData);

  //Sending response with user data
  authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin- add admin================================
// @desc: Admin add admin used to add new admins
// @route: POST /api/v1/user/newadmin/
// @access: private / Admin
const addAssistant = asyncWrapper(async (req, res, next) => {
  const { fullName, username, password, email, passwordConfirm, role } =
    req.body;

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
  const assistant = await userService.addAssistant(validData);
  // Send response
  authResponseSender(assistant, StatusCode.Created, req, res);
});

// =================Delete me================================
// @desc: user can delete its account
// @route: POST /api/v1/user/delete/
// @access: private / Admin

const deleteAccount = asyncWrapper(async (req, res, next) => {});

const newToken = asyncWrapper(async (req, res, next) => {
  const { refreshToken } = req.body;
  const userId = await verifyRefreshToken(refreshToken);
  const user = await userRepo.findById(userId);
  authResponseSender(user, StatusCode.Ok, req, res);
});

module.exports = {
  signUp,
  signIn,
  signOut,
  verify,

  forgotPassword,
  resetPassword,
  updatePassword,
  updatePassword,
  updateInfo,
  uploadAvatar,
  addAssistant,
  newToken,
};
