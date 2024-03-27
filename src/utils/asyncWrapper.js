const { handleCreateError } = require("./product-create-err-handler.js");

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
      next(error);
    }
  };
};

module.exports = { asyncWrapper, asyncWrapperCreate };
