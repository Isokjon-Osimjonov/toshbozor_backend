const Joi = require("joi");
const AppError = require("../utils/appError");
const StatusCode = require("../enums/status-code.enum");


const adminValidationSchema = Joi.object({
  fullName: Joi.string()
    .required()
    .min(4)
    .max(32)
    .regex(/^\s*[A-Za-z]+(?:\s+[A-Za-z]+){1,2}\s*$/)
    .message("Full name can not contain spaces"),

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

  passwordConfirm: Joi.string().required(),

  email: Joi.string().required().email(),
});

const validateAdminData = (data) => {
  const { value, error } = adminValidationSchema.validate(data);
  if (error) {
    throw new AppError(error.stack, error.message, StatusCode.BadRequest);
  }
  return value;
};

module.exports = {
  validateAdminData,
};
