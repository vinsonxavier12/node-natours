const Review = require("../models/reviewModel");
const catchAsyncError = require("../utilities/catchAsyncError");

exports.createReview = catchAsyncError(async (req, res, next) => {
  const review = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    review,
  });
});

exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: "success",
    results: reviews.length,
    reviews,
  });
});
