const catchAsyncError = require("../utilities/catchAsyncError");
const AppError = require("../utilities/appError");
const User = require("../models/userModel");

const filterObj = (obj, ...fields) => {
  let filteredObj = {};
  fields.forEach((field) => {
    if (obj.hasOwnProperty(field)) filteredObj[field] = obj[field];
  });
  return filteredObj;
};

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

exports.updateMe = catchAsyncError(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filterObj(req.body, "name", "email"),
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    updatedUser,
  });
});

exports.deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
