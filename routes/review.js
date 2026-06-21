const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../util/wrapAsync.js");
const ExpressError = require("../util/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewControllers = require("../controllers/reviews.js");
//Post Route
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewControllers.postReviews));

//Delete review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor, 
    wrapAsync(reviewControllers.destroyReview));

module.exports = router;