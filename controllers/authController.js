const User = require("../models/userModel");
const catchAsyncError = require("../utilities/catchAsyncError");
const jwt = require("jsonwebtoken");
const AppError = require("../utilities/appError");
const bcrypt = require("bcryptjs");

function getSignedJwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
}

// Protecting routes by using token authentication
exports.protect = catchAsyncError(async (req, res, next) => {
  if (req.header.token) next();
});

exports.signup = catchAsyncError(async (req, res, next) => {
  const signedupUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = getSignedJwtToken(signedupUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: signedupUser,
    },
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Checking if email and password exists
  if (!email && !password) {
    return next(new AppError("Email and password are missing", 400));
  } else if (!email) {
    return next(new AppError("Email is missing", 400));
  } else if (!password) {
    return next(new AppError("Password is missing", 400));
  }

  // Finding the user with password
  const user = await User.findOne({ email }).select("+password");
  if (user) {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      // User entered correct password
      const token = getSignedJwtToken(user._id);
      return res.status(200).json({
        status: "success",
        token,
        user,
      });
    }
  }

  // Can't find user or entered incorrect password
  next(new AppError("Invalid credentials", 401));
});
