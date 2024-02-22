const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");

const AppError = require("./src/utils/appError");
const environments = require("./src/config/environments.config");
const indexRoutes = require("./src/routes");
const globalErrorHandler = require("./src/middleware/error-handler.middleware");

// express app initialization
const app = express();

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: "application/x-www-form-urlencoded" }));

app.use(express.static(path.join(__dirname, "public")));

//development logging
if (environments.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

console.log(environments.NODE_ENV);
// third party npm packages
app.use(cors());
app.options("*", cors());
app.use(helmet());
app.use(mongoSanitize());

// route
app.use("/api/v1/product", indexRoutes);

// error handling middleware
app.use(globalErrorHandler);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


module.exports = app;
