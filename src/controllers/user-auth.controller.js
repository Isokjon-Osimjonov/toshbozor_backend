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

// @desc: User sign up
// @route: POST /api/v1/user/signup
// @access: private / Admin only accessable for admins
const signUp = asyncWrapper(async (req, res, next) => {
  const { fullName, username, password, email, passwordConfirm, companyName } =
    req.body;

  // Validate admin data
  const validatedData = adminDataValidation.validateAdminData(req.body);

  // Check if required fields are present
  if (
    !validatedData.fullName ||
    !validatedData.username ||
    !validatedData.email ||
    !validatedData.password ||
    !validatedData.passwordConfirm ||
    !validatedData.companyName
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
    companyName: validatedData.companyName,
  };

  await userService.signUp(validData);

  res.status(StatusCode.Pending).json({
    status: SuccessCode.Pending,
    message: "OTP send to your email please check your inbox",
  });

  // Schedule the removal of unverified users after 10 minutes if not already scheduled
  if (!removeUnverifiedUsersTimeout) {
    removeUnverifiedUsersTimeout = setTimeout(async () => {
      try {
        await removeUnverifiedUsers();
      } catch (error) {
        throw error;
      } finally {
        removeUnverifiedUsersTimeout = null;
      }
    }, 10 * 60 * 1000);
  }
});

// =================Admin verify================================
// @desc: User verify
// @route: POST /api/v1/user/verify
// @access: for  users=(admins)
const verify = asyncWrapper(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("Please provide OTP", StatusCode.BadRequest));
  }

  const user = await userService.verify(otp);

  authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin sign in================================
// @desc: User sign in
// @route: POST /api/v1/user/signin
// @access:  Admin / assistant
const signIn = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(
      new AppError(
        "Please provide username and password",
        StatusCode.BadRequest
      )
    );
  }

  const user = await userService.signIn(username, password, req, res);

  await authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin log out================================
// @desc: User log out
// @route: POST /api/v1/user/signout
// @access: Admin / assistant
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
// @access: private / Admin / asistant
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { username } = req.user;
  await userService.forgotPassword(username, req);

  res.status(StatusCode.Ok).json({
    message: "Token sent to email!",
  });
});

// =================Admin reset password================================
// @desc: User reset password
// @route: POST /api/v1/admin/password_reset/:token
// @access: private / Admin / assistant
const resetPassword = asyncWrapper(async (req, res, next) => {
  const { token } = req.params;

  //Assigning fileds to data from body
  const { newPassword, passwordConfirm } = req.body;

  const data = await userService.resetPassword(
    newPassword,
    passwordConfirm,
    token
  );

  authResponseSender(data, StatusCode.Ok, req, res);
});

// =================Admin update password================================
// @desc: User update password
// @route: POST /api/v1/user/password_update/
// @access: private / Admin / assistant
const updatePassword = asyncWrapper(async (req, res, next) => {
  const id = req.user._id;

  const { password, passwordConfirm } = req.body;

  const user = await userService.updatePassword(
    id,
    password,
    passwordConfirm,
    req,
    res
  );

  authResponseSender(user, StatusCode.Ok, req, res);
});

// =================Admin update info================================
// @desc: User update info
// @route: POST /api/v1/user/password_update/
// @access: private / Admin
const updateInfo = asyncWrapper(async (req, res, next) => {
  const id = req.user._id;

  //Defining fileds to update
  const dataToUpdate = filterObj(
    req.body,
    "fullName",
    "username",
    "telegram",
    "address",
    "instragram",
    "number"
  );

  // Validate the data before updating
  const validatedData =
    adminDataValidation.validateAdminDataForUpdate(dataToUpdate);

  if (req.file) {
    validatedData.avatar = req.file.filename;
  }

  const user = await userService.updateInfo(id, validatedData);

  authResponseSender(user, StatusCode.Ok, req, res);
});

// @desc: Toggle user contact info visibility
// @route: POST /api/v1/user/show_info
// @access: Private
const toggleVisibility = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;

  const user = await userRepo.findById(userId);
  if (!user) {
    return next(new AppError("User not found", StatusCode.NotFound));
  }

  user.isVisible = !user.isVisible;
  await user.save({ validateModifiedOnly: true });

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    message: `User visibility toggled to ${user.isVisible}`,
  });
});

// @desc: User enters new email address
// @route: POST /api/v1/user/email_update
// @access: Private
const updateEmail = asyncWrapper(async (req, res, next) => {
  const { _id } = req.user;
  const { newEmail } = req.body;
  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  const user = await userRepo.findById(_id);
  if (!user) {
    return next(new AppError("User not found", StatusCode.NotFound));
  }
  if (user.email === newEmail) {
    return next(
      new AppError("New email is same as old email", StatusCode.BadRequest)
    );
  }
  if (!validateEmail(newEmail)) {
    return next(
      new AppError("Please provide new email", StatusCode.BadRequest)
    );
  }

  await userService.updateEmail(user, newEmail, req);

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
});

// @desc: User verifys new email address
// @route: POST /api/v1/user/email_verify
// @access: Private
const verifyEmail = asyncWrapper(async (req, res, next) => {
  const { otp } = req.body;
  const user = await userService.verifyEmail(otp, req);
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
  updateInfo,
  uploadAvatar,
  toggleVisibility,
  updateEmail,
  verifyEmail,
};
