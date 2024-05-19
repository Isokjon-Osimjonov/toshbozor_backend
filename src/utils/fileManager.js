const fs = require("fs");
const path = require("path");

const unlinkFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const detectImagePath = (filename, basePath) => {

  const filenameParts = filename.split("/");
  const actualFilename = filenameParts[filenameParts.length - 1];

  return path.join(basePath, actualFilename);
};

const detectImagesPath = (filenames, basePath) => {
  return filenames.map((file) => {
    const filenameParts = file.url.split("/");
    const actualFilename = filenameParts[filenameParts.length - 1];
    return path.join(basePath, actualFilename);
  });
};

module.exports = {
  unlinkFile,
  detectImagePath,
  detectImagesPath,
};
