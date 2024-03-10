const fs = require("fs");

exports.handleCreateError = (req, res, err) => {
  // Delete uploaded files if error occurs
  if (req.files) {
    req.files.forEach((file) => {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      });
    });
  }
  res.status(500).json({
    message: "Error creating product",
    error: `handleCreateError ${err.message}`,
  });
};

exports.handleValidationError = (req, res, error) => {
  // Delete uploaded files if validation error occurs
  if (req.files) {
    req.files.forEach((file) => {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      });
    });
  }
  res.status(400).json({
    message: error.message,
  });
};
