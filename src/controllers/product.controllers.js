const productService = require("../services/product.services.js");
const {
  asyncWrapper,
  asyncWrapperCreate,
} = require("../utils/asyncWrapper.js");
const photoUpload = require("../utils/photoUpload.js");
const { StatusCode } = require("../enums/status-code.enum.js");
const { SuccessCode } = require("../enums/success-code.enum.js");
const userRepo = require("../repositories/user.repo.js");
const productRepo = require("../repositories/product.repo.js");
const productModel = require("../models/product.model.js");
const sharp = require("sharp");
const model = productModel;
const path = require("path");
const { cleanupFiles } = require("../utils/product-create-err-handler.js");
const { unlinkFile, detectImagesPath } = require("../utils/fileManager");

// Middleware for uploading product photo.
const uploadImages = photoUpload("memory").array("image", 10);

const resizeImage = asyncWrapper(async (file, req) => {
  if (!file) throw new AppError("Please upload an image", 400);

  try {
    const originalMetadata = await sharp(file.buffer).metadata();
    const originalWidth = originalMetadata.width;
    const originalHeight = originalMetadata.height;

    const filename = `productImage-${Date.now()}.webp`;

    const imagePath = path.join("public/images/product_images", filename);

    await sharp(file.buffer)
      .resize({
        width: originalWidth,
        height: originalHeight,
        fit: "fill",
      })
      .toFormat("webp")
      .toFile(imagePath);

    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/images/product_images/${filename}`;
    return { imageUrl, imagePath };
  } catch (error) {
    console.error("Error processing image:", error);
    throw new AppError("Image processing failed", 500);
  }
});

const processImages = async (files, req) => {
  const images = [];
  const imagePaths = [];

  for (const file of files) {
    const { imageUrl, imagePath } = await resizeImage(file, req);
    images.push({ url: imageUrl });
    imagePaths.push(imagePath);
  }

  return { images, imagePaths };
};
// @desc: Create new product
// @route: POST /api/v1/product/:productType
// @access: private / Admin
const createProduct = asyncWrapperCreate(async (req, res, next) => {
  const {
    category,
    productname,
    price,
    description,
    size,
    height,
    width,
    length,
  } = req.body;
  let imagePaths = [];

  try {
    const { images, imagePaths: processedImagePaths } = await processImages(
      req.files,
      req
    );
    imagePaths = processedImagePaths;

    const data = {
      category,
      productname,
      price,
      description,
      size,
      image: images,
      height,
      width,
      length,
    };

    const result = await productService.create(model, data, {
      runValidators: true,
    });

    const productCreator = req.user._id;
    await userRepo.findByIdAndUpdate(productCreator, {
      $push: { products: result._id },
    });

    res.status(StatusCode.Created).json({
      status: SuccessCode.Success,
      data: result,
    });
  } catch (error) {
    cleanupFiles(imagePaths);
    next(error);
  }
});

// @desc: Get all products
// @route: GET /api/v1/product/:productType
// @access: private / Admin
const getAllProducts = asyncWrapper(async (req, res, next) => {
  const productModel = req.productModel;
  const result = await productService.getAll(productModel);

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    data: result,
  });
});

// @desc: Get products by category
// @route: GET /api/v1/product/:category
// @access: private / Admin & Assistant
const getProductsByCategory = asyncWrapper(async (req, res, next) => {
  const { category } = req.params;
  const result = await productRepo.getByCategory(model, category);

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    data: result,
  });
});

// @desc: Get product
// @route: GET /api/v1/product/:productType/:id
// @access: private / Admin
const getProductById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const result = await productService.getById(model, id);

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
    data: result,
  });
});

// @desc: Update product
// @route: PUT /api/v1/product/:productType/:id
// @access: private / Admin
const updateProduct = asyncWrapperCreate(async (req, res, next) => {
  const { id } = req.params;
  const { productname, price, description, size } = req.body;
  let imagePaths = [];

  try {
    const { images, imagePaths: processedImagePaths } = await processImages(
      req.files,
      req
    );
    imagePaths = processedImagePaths;
    const data = { productname, price, description, size, image: images };

    const result = await productService.update(model, id, data);

    res.status(StatusCode.Ok).json({
      status: SuccessCode.Success,
      data: result,
    });
  } catch (error) {
    cleanupFiles(imagePaths);
    next(error);
  }
});

// @desc: Delete product
// @route: DELETE /api/v1/product/:productType/:id
// @access: private / Admin
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const product = await productService.getById(model, id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  const filename = product.image;
  const basePath = path.join(__dirname, "../../public/images/product_images");
  const filePaths = detectImagesPath(filename, basePath);

  for (const filePath of filePaths) {
    await unlinkFile(filePath);
  }

  await productService.deleteProduct(model, id);

  const productCreator = req.user._id;
  await userRepo.findByIdAndUpdate(productCreator, {
    $pull: {
      products: id,
    },
  });

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
});

// @desc: Delete all product
// @route: DELETE /api/v1/product/:productType
// @access: private / Admin
const deleteAllProducts = asyncWrapper(async (req, res, next) => {
  await productService.deleteAllProducts(model);

  res.status(StatusCode.Ok).json({
    status: SuccessCode.Success,
  });
});

module.exports = {
  createProduct,
  uploadImages,
  resizeImage,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  getProductsByCategory,
};
