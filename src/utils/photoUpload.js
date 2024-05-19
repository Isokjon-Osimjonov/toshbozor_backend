const multer = require("multer");
const path = require("path");

// Creating and setting storage
const destination = "./public/images";
const storage = multer.diskStorage({
  destination: destination,
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const multerStorage = multer.memoryStorage();

// Initializing upload function
const fileSizeLimit = 10 * 1024 * 1024 * 3;
const photoUpload = multer({
  storage: multerStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: function (req, file, cb) {
    checkFileTypes(file, cb);
  },
});

// Function to handle file type validation
const checkFileTypes = (file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (mimeType && extname) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, PNG files are allowed."));
  }
};

module.exports = photoUpload;
