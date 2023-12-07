const express = require("express");
const morgan = require("morgan");

const AppError = require("./utilities/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
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
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
module.exports = app;
