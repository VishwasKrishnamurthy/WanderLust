const ExpressError = require("../utils/expressError.js");
const listing = require("../models/listing.js");
const review = require("../models/review.js");

module.exports.postreview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listingData = await listing.findById(id);

    if (!listingData) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const newReview = new review(req.body);
    console.log(newReview);
    newReview.author = res.locals.curUser;
    listingData.reviews.push(newReview);

    await listingData.save();
    await newReview.save();

    req.flash("success", "New Review Added !");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.deletereview = async (req, res, next) => {
  try {
    const { id, reviewid } = req.params;

    await review.findByIdAndDelete(reviewid);
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });

    req.flash("success", "Review Deleted !");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};
