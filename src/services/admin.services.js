const adminRepo = require("../repositories/admin.repo");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const crypto = require("crypto");
const hashedPassword = require("../utils/hash-password");
const { sendPasswordResetEmail } = require("../utils/email");
const { StatusCode } = require("../enums/status-code.enum");
const { datacatalog } = require("googleapis/build/src/apis/datacatalog");

//===============Fund by id
const findById = async (id) => {
  return await adminRepo.findById(id);
};

//===============Fund by id
const findOne = async (data) => {
  return await adminRepo.findOne(data);
};

// =================Admin sign up
const signUp = async (data) => {
  // Check if user already exist
  const isExist = await adminRepo.findOne({ username: data.username });
  if (isExist) {
    throw new AppError("User already exist", 400);
  }


  // Create admin
  // const admin = await adminRepo.signUp(data);
  const admin = new Admin(data)
  
  // Send response
  return admin;
};




// =================Admin sign in
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

// =================Admin  forgot password
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
  await sendPasswordResetEmail(user, url);

  return { message: "Password reset link has been sent." };
};

// =================Admin  reset password
const resetPassword = async (newPassword, passwordConfirm, token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await adminRepo.findOne({
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

// =================Admin  update password
const updatePassword = async (id, password, passwordConfirm, req, res) => {
  const user = await adminRepo.findById(id);

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

// =================Admin  update info

const updateInfo = async (id, data) => {
  const user = await adminRepo.findByIdAndUpdate(id, data);

};

module.exports = {
  findById,
  findOne,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateInfo,
};
