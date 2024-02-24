const Joi = require("joi");
const AppError = require("../utils/appError");
const StatusCode = require("../enums/status-code.enum");
const adminValidationSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(4)
    .max(32)
    .pattern(/^\S*$/)
    .message("Username can not contain spaces"),
  password: Joi.string()
    .required()
    .min(8)
    .max(1024)
    .pattern(/^\S*$/)
    .message("Passsword can not contain spaces"),
  email: Joi.string().required().email(),
});

const validateAdminData = (data) => {
  const { value, error } = adminValidationSchema.validate(data);
  if (error) {
    throw new AppError(error.message, StatusCode.BadRequest);
  }
  return value;
};

module.exports = {
  validateAdminData,
};
