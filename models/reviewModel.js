const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Must contain review"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A review must have a rating"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.SchemaType.ObjectId,
      ref: "Tour",
      required: [true, "A review must have a tour associated"],
    },
    userId: {
      type: mongoose.SchemaType.ObjectId,
      ref: "User",
      required: [true, "A review must have a user associated"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
