const path = require("path");
const photoUpload = require("../utils/photoUpload.js");
const { asyncWrapper } = require("../utils/asyncWrapper.js");
const { StatusCode } = require("../enums/status-code.enum.js");
const { SuccessCode } = require("../enums/success-code.enum.js");
const WorkExamplesModel = require("../models/work.examples.model.js");
const AppError = require("../utils/appError.js");
const { unlinkFile, detectImagePath } = require("../utils/fileManager");
const sharp = require("sharp");

// Middleware for uploading work example images.
const uploadImage = photoUpload("memory").single("image");

const resizeImage = asyncWrapper(async (req, res, next) => {
  if (!req.file) return next();

  const originalMetadata = await sharp(req.file.buffer).metadata();
  const originalWidth = originalMetadata.width;
  const originalHeight = originalMetadata.height;

  req.file.filename = `image-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .resize({
      width: originalWidth,
      height: originalHeight,
      fit: "fill",
    })
    .toFormat("webp")
    .toFile(`public/images/work_examples/${req.file.filename}`);
  next();
});

// @desc:  Main admin can upload work examples images
// @route: POST /api/v1/examples/upload
// @access: main admin
const uploadExampleImages = asyncWrapper(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload an image", StatusCode.BadRequest);
  }
  const image = `${req.protocol}://${req.get("host")}/images/work_examples/${
    req.file.filename
  }`;

  await WorkExamplesModel.create({ image });

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
});

// @desc:  Get work examples images
// @route: GET /api/v1/examples/images
// @access: public
const getWorkExamplesImages = asyncWrapper(async (req, res) => {
  const images = await WorkExamplesModel.find({});

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    data: images,
  });
});

// @desc:  Delete work examples images
// @route: DELETE /api/v1/examples/images
// @access: main admin
const deleteWorkExamplesImages = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const exampleImage = await WorkExamplesModel.findById(id);
  if (!exampleImage) {
    return res.status(404).json({ status: SuccessCode.Fail });
  }

  const filename = exampleImage.image;
  const basePath = path.join(__dirname, "../../public/images/work_examples");
  const filePath = detectImagePath(filename, basePath);

  await unlinkFile(filePath);

  await WorkExamplesModel.findByIdAndDelete(id);
  res.status(200).json({
    status: SuccessCode.Success,
  });
});

module.exports = {
  uploadImage,
  uploadExampleImages,
  getWorkExamplesImages,
  deleteWorkExamplesImages,
  resizeImage,
};
