"use strict";

var express = require("express");

var path = require("path");

var morgan = require("morgan");

var rateLimit = require("express-rate-limit");

var helmet = require("helmet");

var mongoSanitize = require("express-mongo-sanitize");

var xss = require("xss-clean");

var hpp = require("hpp");

var AppError = require("./utilities/appError");

var tourRouter = require("./routes/tourRoutes");

var userRouter = require("./routes/userRoutes");

var reviewRouter = require("./routes/reviewRoutes");

var errorController = require("./controllers/errorController");

var app = express(); // Setting pug as view engine

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); // DEV ENVIRONMENT LOGGING FOR REQUESTS

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
} // HELMET. SETTING SECURITY HEADERS


app.use(helmet()); // RATE LIMITING

var limiter = rateLimit({
  max: 100,
  window: 1 * 60 * 60 * 1000,
  message: "Too many requests.  Please try again after an hour"
});
app.use("/api", limiter); // BODY PARSER. SETTING JSON DATA LIMIT

app.use(express.json({
  limit: "10kb"
}));
app.use(express["static"]("".concat(__dirname, "/public"))); // MONGO SANITIZATION

app.use(mongoSanitize()); // XSS SANITIZATION

app.use(xss()); // PREVENTING PARAMETER POLLUTION

app.use(hpp({
  whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
}));
app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
});
app.get("/", function (req, res) {
  res.status(200).render("base", {
    tour: "Test tour",
    text: "This is a test text"
  });
});
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter); // Only hits this middleware if no routes found before

app.all("*", function (req, res, next) {
  // If we pass any error inside next, express knows it's an error
  next(new AppError("Can't find ".concat(req.originalUrl, " on the server"), 404));
}); // Global error handler function
// Mongoose knows it is a error handler by having 4 parameters

app.use(errorController);
module.exports = app;