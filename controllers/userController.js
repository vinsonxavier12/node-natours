const catchAsyncError = require("../utilities/catchAsyncError");
const User = require("../models/userModel");
const factory = require("./handlerFactory");

const filterObj = (obj, ...fields) => {
  let filteredObj = {};
  fields.forEach((field) => {
    if (obj.hasOwnProperty(field)) filteredObj[field] = obj[field];
  });
  return filteredObj;
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
/* 
  Don't change password on this handler since it wont call the middlewares
  that gets called using .save() method
*/
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

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
