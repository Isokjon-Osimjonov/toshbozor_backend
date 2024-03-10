const {
  handleCreateError,
  handleValidationError,
} = require("./product-create-err-handler.js");

//This function is used to handle errors in the create product route
const asyncWrapperCreate = (fn) => {
  // Return middleware function for handling HTTP requests
  return async (req, res, next) => {
    try {
      // Call the asynchronous route handler function with provided parameters
      await fn(req, res, next);
    } catch (error) {
      // Check the type of error and handle accordingly
      if (error.name === "ValidationError") {
        handleValidationError(req, res, error);
      } else {
        handleCreateError(req, res, error);
      }
    }
  };
};


//This function is used to handle errors 
const asyncWrapper = (fn) => {
  // Return middleware function for handling HTTP requests
  return async (req, res, next) => {
    try {
      // Call the asynchronous route handler function with provided parameters
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { asyncWrapper, asyncWrapperCreate };
