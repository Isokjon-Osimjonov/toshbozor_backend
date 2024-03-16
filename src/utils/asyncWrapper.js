const {
  handleCreateError,
  handleUpdateError,
} = require("./product-create-err-handler.js");

const asyncWrapperCreate = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      handleCreateError(req, res, error);
    }
  };
};

const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // handleUpdateError(req, res, error);
      next(error);
    }
  };
};

module.exports = { asyncWrapper, asyncWrapperCreate };
