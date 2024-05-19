const userRepo = require("../repositories/user.repo");
const AppError = require("../utils/appError");
const { StatusCode } = require("../enums/status-code.enum");

// @desc: Admin add admin used to add new admins
const addAssistant = async (data) => {
  const isExist = await userRepo.findOne({ username: data.username });
  if (isExist) {
    throw new AppError("Username is already taken", StatusCode.BadRequest);
  }
  data.isVerified = true;
  const assistant = await userRepo.create(data);

  return assistant;
};


// @desc: main admin can disable assistant's account
const manageAssistant = async (username) => {
  const assistant = await userRepo.findOne({ username });
  if (!assistant) {
    throw new AppError(
      `Assistant with username ${username} not found`,
      StatusCode.NotFound
    );
  }
  if (assistant.role !== "assistant") {
    throw new AppError(
      "Only assistant admins can be disabled or enabled",
      StatusCode.BadRequest
    );
  }
  assistant.isDisabled = !assistant.isDisabled;
  await assistant.save({ validateModifiedOnly: true });
};

// @desc: main admin can delete assistant's account
const deleteAssistant = async (username) => {
  const assistant = await userRepo.findOne({ username });
  if (!assistant) {
    throw new AppError(
      `Assistant with username ${username} not found`,
      StatusCode.NotFound
    );
  }
  if (assistant.role !== "assistant") {
    throw new AppError(
      "Only assistant admins can deleted",
      StatusCode.BadRequest
    );
  }
  await userRepo.deleteOne({ username });
};

// @desc: Gettign all users admins and assistants
const getUsers = async () => {
  const users = await userRepo.find({});
  return users;
};

module.exports = {
  addAssistant,
  manageAssistant,
  deleteAssistant,
  getUsers,
};
