const Review = require("../models/reviewModel");
const catchAsyncError = require("../utilities/catchAsyncError");

exports.createReview = catchAsyncError(async (req, res, next) => {
  // const data = {
  //   tour: req.params.tourId,
  //   user: req.user._id,
  //   ...req.body,
  // };

  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    review,
  });
});

exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  let reviews;
  if (req.params.tourId) {
    reviews = await Review.find({ tour: req.params.tourId });
  } else {
    reviews = await Review.find();
  }
  res.status(200).json({
    status: "success",
    results: reviews.length,
    reviews,
  });
});
