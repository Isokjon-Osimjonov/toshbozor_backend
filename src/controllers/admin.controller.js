const amdinServices = require("../services/admin.services.js");
const { asyncWrapper } = require("../utils/asyncWrapper.js");
const { StatusCode } = require("../enums/status-code.enum.js");
const AppError = require("../utils/appError.js");
const { SuccessCode } = require("../enums/success-code.enum.js");
const userRepo = require("../repositories/user.repo.js");
const adminDataValidation = require("../validators/admin.validator.js");
const authResponseSender = require("../middleware/response-handler.middleware.js");
// @desc: Admin add admin used to add new admins
// @route: POST /api/v1/user/newadmin/
// @access: private / Admin
const addAssistant = asyncWrapper(async (req, res, next) => {
  const { fullName, username, password, email, passwordConfirm, role } =
    req.body;

  const validatedData = adminDataValidation.validateAdminData(req.body);
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

  const assistant = await amdinServices.addAssistant(validData);

  res.status(200).json({
    status: SuccessCode.Success,
  });
});

// @desc: main admin can disable assistant's account
// @route: POST /api/v1/user/disable/:username
// @access: private / Admin
const manageAssistant = asyncWrapper(async (req, res, next) => {
  const { username } = req.params;
  await amdinServices.manageAssistant(username);
  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
});

// @desc: main admin can delete assistant's account
// @route: POST /api/v1/user/delete/:username
// @access: private / Admin
const deleteAssistant = asyncWrapper(async (req, res, next) => {
  const { username } = req.params;
  await amdinServices.deleteAssistant(username);
  //Send response
  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
});

// @desc: Gettign all users admins and assistants
// @route: POST /api/v1/user/users
// @access: private / Admin
const getUsers = asyncWrapper(async (req, res, next) => {
  const users = await amdinServices.getUsers();
  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    data: users,
  });
});

// @desc: Gettign all users admins and assistants
// @route: POST /api/v1/user/users
// @access: private / Admin
const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await userRepo.find({});

  if (!users.length) {
    return next(new AppError("No users found", StatusCode.NotFound));
  }

  const usersWithConditionalContacts = users.map((user) => {
    const userObject = user.toObject({ getters: true });
    if (!user.isVisible) {
      delete userObject.contactInfo;
    }
    return userObject;
  });

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    data: usersWithConditionalContacts,
  });
});

module.exports = {
  addAssistant,
  manageAssistant,
  deleteAssistant,
  getUsers,
  getAllUsers,
};
