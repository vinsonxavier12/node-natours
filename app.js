const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const AppError = require("./utilities/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const errorController = require("./controllers/errorController");

const app = express();

// DEV ENVIRONMENT LOGGING FOR REQUESTS
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// HELMET. SETTING SECURITY HEADERS
app.use(helmet());

// RATE LIMITING
const limiter = rateLimit({
  max: 3,
  window: 1 * 60 * 60 * 1000,
  message: "Too many requests.  Please try again after an hour",
});
app.use("/api", limiter);

// BODY PARSER. SETTING JSON DATA LIMIT
app.use(express.json({ limit: "10kb" }));
app.use(express.static(`${__dirname}/public`));

// MONGO SANITIZATION
app.use(mongoSanitize());

// XSS SANITIZATION
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Only hits this middleware if no routes found before
app.all("*", (req, res, next) => {
  // If we pass any error inside next, express knows it's an error
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// Global error handler function
// Mongoose knows it is a error handler by having 4 parameters
app.use(errorController);
module.exports = app;
