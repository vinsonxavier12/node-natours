const catchAsyncError = require("../utilities/catchAsyncError");
const AppError = require("../utilities/appError");
const User = require("../models/userModel");

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: "success",
    users: allUsers,
  });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    user,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};
