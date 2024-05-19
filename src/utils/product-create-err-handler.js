const fs = require("fs");

exports.handleCreateError = (req, res, err) => {
  if (req.files) {
    req.files.forEach((file) => {
      if (file.path) {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file:", unlinkErr);
          }
        });
      }
    });
  }
  res.status(500).json({ error: ` ${err.message}` });
};

exports.handleUpdateError = (req, res, err) => {
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

exports.cleanupFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    });
  });
};
