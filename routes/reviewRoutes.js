const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
/* 
  Because we have mentioned mergeParams: true in router options,
  Both the router
    POST /tours/:tourId/reviews
    POST /reviews
  gets matched in '/'
*/
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview,
  );

module.exports = router;
