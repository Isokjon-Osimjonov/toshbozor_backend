const fs = require("fs");

exports.handleCreateError = (req, res, err) => {
  if (req.file) {
    // Delete uploaded file if error occurs
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    });
  }
  res.status(500).json({
    message: "Error creating product",
    error: `handleCreateError  ${err.message} `,
  });
};

exports.handleValidationError = (req, res, error) => {
  if (req.file) {
    // Delete uploaded file if validation error occurs
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    });
  }
  res.status(400).json({
    message: error.message,
  });
};
