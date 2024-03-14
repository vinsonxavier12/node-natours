const multer = require("multer");
const sharp = require("sharp");

const catchAsyncError = require("../utilities/catchAsyncError");
const User = require("../models/userModel");
const factory = require("./handlerFactory");
const AppError = require("../utilities/appError");

const filterObj = (obj, ...fields) => {
  let filteredObj = {};
  fields.forEach((field) => {
    if (Object.hasOwnProperty.bind(obj)(field)) filteredObj[field] = obj[field];
  });
  return filteredObj;
};

// Defining multer storage path and filename
// const multerStorage = multer.diskStorage({
//   // Multer provides request, file and a callback in which we
//   // set the result using the callback. The first param of callback
//   // is for error and the second is the result for the field
//   destination: (req, file, cb) => cb(null, "public/img/users"),
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) return cb(null, true);
  else return cb(new AppError("Please upload only images", 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
/* 
  Don't change password on this handler since it wont call the middlewares
  that gets called using .save() method
*/
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// upload.single() corresponds to uploading only one photo
exports.uploadUserPhoto = upload.single("photo");

// We are saving the uploaded image in memory and accessing in sharp as buffer
// and resizing it and saving it to system with our custom filename
exports.resizeUserPhoto = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.updateMe = catchAsyncError(async (req, res, next) => {
  const filteredObj = filterObj(req.body, "name", "email");
  if (req.file) filteredObj.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

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
