const adminRepo = require("../repositories/admin.repo");
const AppError = require("../utils/appError");

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
  //   const token = admin.generateToken();

  // Removing password property from admin object
  admin.password = undefined;

  // Send response
  return admin;
};

module.exports = {
  signUp,
  signIn,
};
