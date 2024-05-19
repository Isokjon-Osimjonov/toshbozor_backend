const path = require("path");

const detectImagePath = (filename, basePath) => {
  const filenameParts = filename.split("/");
  const actualFilename = filenameParts[filenameParts.length - 1];

  return path.join(basePath, actualFilename);
};

module.exports = { detectImagePath };
