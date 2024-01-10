const User = require("../models/userModel");
const catchAsyncError = require("../utilities/catchAsyncError");
const jwt = require("jsonwebtoken");
const AppError = require("../utilities/appError");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

function getSignedJwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
}

// Protecting routes by using token authentication
exports.protect = catchAsyncError(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(new AppError("Missing authorization token in header", 401));

  // Checking if token contents are changed
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_KEY,
  );
  const user = await User.findById(decodedPayload.id);
  if (!user) return next(new AppError("User doesn't exist", 400));

  if (user.isChangedPasswordAfterTokenIssued(decodedPayload.iat)) {
    // If user changed password after token issued
    return next(
      new AppError("Password changed.  Please login again to continue", 401),
    );
  }

  // Proceeding protected route
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

exports.signup = catchAsyncError(async (req, res, next) => {
  const signedupUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
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
    // Comparing passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      // User entered correct password
      const token = getSignedJwtToken(user._id);
      return res.status(200).json({
        status: "success",
        token,
      });
    }
  }

  // Can't find user or entered incorrect password
  next(new AppError("Invalid credentials", 401));
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No user found with specified email"));

  const passwordToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false }); // Turning off validation

  return res.status(200).json({
    status: "success",
    token: passwordToken,
  });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {});
