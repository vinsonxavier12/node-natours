const User = require("../models/userModel");
const catchAsyncError = require("../utilities/catchAsyncError");
const jwt = require("jsonwebtoken");
const AppError = require("../utilities/appError");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utilities/email");
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

  const resetUrl = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${passwordToken}`;
  const message = `Do you want to reset your password?  Submit a PATCH request with your new password
  and confirm password to: ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token (Valid for only 10 mins)",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending email.  Try again later", 500),
    );
  }

  return res.status(200).json({
    status: "success",
    message: "Email sent successfully",
  });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const encryptedPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Fetching the user
  const user = await User.findOne({
    passwordResetToken: encryptedPasswordToken,
  });
  if (!user) return next(new AppError("User not found or invalid token", 500));

  // Checking if token expired
  if (Date.now() > user.passwordResetExpires.getTime()) {
    return next(
      new AppError(
        "Token expired.  Gererate a new token to change your password",
        500,
      ),
    );
  }

  // Checking for password data
  if (!req.body.password || !req.body.confirmPassword)
    return next(new AppError("password and confirmPassword is required", 500));
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  // Updating password changed at to current time
  user.passwordUpdatedAt = Date.now();
  // Removing password reset token and token expiry from db
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Creating new jwt token and sending
  const token = getSignedJwtToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
