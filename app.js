const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const AppError = require("./src/utils/appError");
const environments = require("./src/config/environments.config");
const indexRoutes = require("./src/routes");
const globalErrorHandler = require("./src/middleware/global-error-handler.middleware");
const logger = require("./src/utils/logger");
require("./src/config/redis.config");

// express app initialization
const app = express();

//body parser
app.use(express.json());

// Use cookie-parser middleware
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: "application/x-www-form-urlencoded" }));

app.use(express.static(path.join(__dirname, "public")));

//development logging
if (environments.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

console.log(environments.NODE_ENV);
// third party npm packages
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    withCredentials: true,
  })
);

app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// route
app.use("/api/v1", indexRoutes);

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// error handling middleware
app.use(globalErrorHandler);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something is broken!");
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
