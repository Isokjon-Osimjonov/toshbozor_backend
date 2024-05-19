const userRepo = require("../repositories/user.repo");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/email");
const { StatusCode } = require("../enums/status-code.enum");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/email");

//====================================Admin sign up
const signUp = async (data) => {
  // Check if user already exist
  const isExist = await userRepo.findOne({ username: data.username });
  if (isExist) {
    throw new AppError("User already exist", 400);
  }

  // Create admin
  const user = await userRepo.create(data);
  const email = user.email;
  //Generating OTP
  const otp = await user.sendVerificationOTP();
  await user.save({ validateBeforeSave: false });

  // Send OTP to the user's email
  await sendOTPEmail(user, email, otp);
};

//====================================Admin verify
const verify = async (otp) => {
  const url = "https://toshbozor.uz";

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await userRepo.findOne({
    otp: hashedOTP,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid OTP", 400);
  }
  // 2) Update user's otp to null
  user.otp = undefined;
  user.otpExpires = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  // 3) Send welcome email to the user
  await sendWelcomeEmail(user, url);
  return user;
};

//====================================Admin sign in
const signIn = async (username, password, req, res) => {
  const user = await userRepo.findOne({
    username,
    isVerified: true,
    role: ["admin", "assistant"],
  });

  // Check if user exist and password is correct
  if (!user || !(await user.correctPassword(password))) {
    throw new AppError(
      "Invalid credentials username or password is incorrect",
      401
    );
  }

  // Send response
  return user;
};

//====================================Admin  forgot password
const forgotPassword = async (username, req) => {
  // 1) Get user based on POSTed username
  const user = await userRepo.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  // 2) Calling admin createPasswordResetToken method to generate random reset token and save it to the database
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const url = `https://admin.toshbozor.uz/password_reset/${resetToken}`;

  // 3) Send email to the user
  await sendPasswordResetEmail(user, url);
};

//====================================Admin  reset password
const resetPassword = async (newPassword, passwordConfirm, token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await userRepo.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Password reset token is invalid or has expired", 400);
  }
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return user;
};

//====================================Admin  update password
const updatePassword = async (id, password, passwordConfirm, req, res) => {
  const user = await userRepo.findById(id);

  //Check if current password is correct
  if (!(await user.correctPassword(req.body.currentPassword))) {
    throw new AppError(
      "Current password is incorrect",
      StatusCode.Unauthorized
    );
  }

  //If all is correct, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  return user;
};

//====================================Admin  update info
const updateInfo = async (id, validatedData) => {
  // Find the user by ID
  const user = await userRepo.findByIdAndUpdate(id, validatedData);

  if (!user) {
    throw new AppError("Something went wrong ", 400);
  }

  return user;
};

const updateEmail = async (user, newEmail, req) => {
  //Generating OTP
  const otp = await user.sendVerificationOTP();
  user.newEmail = newEmail;
  await user.save({ validateBeforeSave: false });

  // Send OTP to the user's new email
  await sendOTPEmail(user, newEmail, otp);
};

const verifyEmail = async (otp, req) => {
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await userRepo.findOne({
    otp: hashedOTP,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid OTP", 400);
  }
  // 2) Update user's otp to null
  user.email = user.newEmail;
  user.newEmail = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

module.exports = {
  signUp,
  signIn,
  verify,

  forgotPassword,
  resetPassword,
  updatePassword,
  updateInfo,
  updateEmail,
  verifyEmail,
};
