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
    error: ` ${err.message}`,
  });
};

exports.handleUpdateError = (req, res, err) => {
  // Delete uploaded files if error occurs
  if (req.file) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    });
  }

  res.status(500).json({
    error: ` ${err.message}`,
  });
};
