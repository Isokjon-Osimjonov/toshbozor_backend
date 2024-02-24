const adminRepo = require("../repositories/admin.repo");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const crypto = require("crypto");
const hashedPassword = require("../utils/hash-password");

// =================Admin sign up================================
const signUp = async (data) => {
  // Check if user already exist
  const isExist = await adminRepo.findOne({ username: data.username });
  if (isExist) {
    throw new AppError("User already exist", 400);
  }

  // Create admin
  const admin = await adminRepo.signUp(data);

  // Send response
  return admin;
};

// =================Admin sign in================================
const signIn = async (username, password) => {
  // Check if user exist
  const admin = await adminRepo.findOne({ username });

  // Check if user exist and password is correct
  if (!admin || !(await admin.correctPassword(password))) {
    throw new AppError(
      "Invalid credentials username or password is incorrect",
      401
    );
  }

  // Send response
  return admin;
};

// =================Admin  forgot password================================
const forgotPassword = async (username, req) => {
  // 1) Get user based on POSTed username
  const user = await adminRepo.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  // 2) Calling admin createPasswordResetToken method to generate random reset token and save it to the database
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send email to the user
  const url = `${req.protocol}://${req.get(
    "host"
  )}/password_reset/${resetToken}`;
  await new Email(user, url).sendPasswordReset();

  return { message: "Password reset link has been sent." };
};

// =================Admin  reset password================================
const resetPassword = async (neWpassword, token) => {

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await adminRepo.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Password reset token is invalid or has expired", 400);
  }
  user.password = await hashedPassword(neWpassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return user;
};
module.exports = {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
};
