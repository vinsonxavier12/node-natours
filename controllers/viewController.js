const Tour = require("../models/tourModel");
const catchAsyncError = require("../utilities/catchAsyncError");

exports.overview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.tour = catchAsyncError(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "user rating review",
  });
  res.status(200).render("tour", {
    title: "test tour",
    tour,
  });
});
