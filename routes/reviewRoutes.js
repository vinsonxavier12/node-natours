const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
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
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user, admin"),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo("admin, user"),
    reviewController.deleteReview,
  );

module.exports = router;
