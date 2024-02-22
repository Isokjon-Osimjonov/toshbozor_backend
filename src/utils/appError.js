class AppError extends Error {
  constructor(message, statusCode) {
    // Call the parent constructor with the error message
    super(message);

    // Set the statusCode and status properties
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Set isOperational property to true
    this.isOperational = true;

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
