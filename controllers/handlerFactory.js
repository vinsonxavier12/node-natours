const AppError = require("../utilities/appError");
const catchAsyncError = require("../utilities/catchAsyncError");
const APIFeatures = require("../utilities/apiFeatures");

exports.getAll = (Model) =>
  catchAsyncError(async (req, res, next) => {
    // To allow nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: doc,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populateOptions);
    if (!doc)
      return next(new AppError("No document found with the specified ID", 404));
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) return next(new AppError("Something went wrong", 500));
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return next(new AppError("No document found with the specified ID", 404));
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return next(new AppError("No document found with the specified ID", 404));
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
