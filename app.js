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

// const session = require("express-session");
// const MongoStore = require("connect-mongo");

// express app initialization
const app = express();

// session store
// const time = 60 * 60 * 1000;

// const sessionStore = MongoStore.create({
//   mongoUrl: process.env.MONGODB_URI,
//   collectionName: "session",
//   autoRemove: "native",
//   ttl: new Date(Date.now() + time),
// });

// app.use(
//   session({
//     secret: "super-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false, maxAge: time },
//     maxAge: new Date(Date.now() + time),
//     store: sessionStore,
//   })
// );

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
app.use("/api/v1", indexRoutes);

// error handling middleware
app.use(globalErrorHandler);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


module.exports = app;
