const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const days =
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

  if (days <= 0) {
    req.flash("error", "Invalid booking dates");
    return res.redirect(`/listings/${id}`);
  }

  const totalPrice = days * listing.price;

  const booking = new Booking({
    listing: id,
    user: req.user._id,
    startDate,
    endDate,
    totalPrice,
  });

  await booking.save();

  req.flash("success", "Booking successful!");
  res.redirect(`/listings/${id}`);
};
  