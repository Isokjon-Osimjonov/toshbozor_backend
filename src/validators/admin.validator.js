const Joi = require("joi");
const AppError = require("../utils/appError");
const StatusCode = require("../enums/status-code.enum");

const adminValidationSchema = Joi.object({
  fullName: Joi.string()
    .required()
    .min(4)
    .max(32)
    .pattern(/^\S.*\S$/)
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

  role: Joi.string().valid("admin", "assistant").default("assistant"),
});

const validateAdminData = (data) => {
  const { value, error } = adminValidationSchema.validate(data);
  if (error) {
    throw new AppError(error.message, StatusCode.BadRequest);
  }
  return value;
};

// Define the Joi schema for validating admin data
const adminValidationSchemaForUpdate = Joi.object({
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

  // Remove password and passwordConfirm from the schema as they are not being updated
});

const validateAdminDataForUpdate = (data) => {
  const { value, error } = adminValidationSchemaForUpdate.validate(data, {
    abortEarly: false,
  });
  if (error) {
    throw new AppError(error.message, StatusCode.BadRequest);
  }
  return value;
};

module.exports = {
  validateAdminData,
  validateAdminDataForUpdate,
};
