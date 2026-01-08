const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const { isloggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const Booking = require("../models/booking");

/**
 * =========================
 * GET → Show booking page
 * =========================
 * URL: /listings/:id/bookings/book
 */
router.get(
  "/book",
  isloggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // 🔴 Get confirmed bookings
    const bookings = await Booking.find({
      listing: id,
      status: "confirmed",
    });

    res.render("bookings/book", {
      listing,
      bookings
    });
  })
);


/**
 * =========================
 * POST → Validate dates & create booking session
 * =========================
 * URL: /listings/:id/bookings
 */
router.post(
  "/",
  isloggedIn,
  wrapAsync(async (req, res) => {

    console.log("🔥 POST /bookings HIT");
    console.log("BODY:", req.body);

    const { id } = req.params;
    const { from, to } = req.body;

    // 1️⃣ Empty date check
    if (!from || !to) {
      req.flash("error", "Please select both dates");
      return res.redirect(`/listings/${id}/bookings/book`);
    }

    // 2️⃣ Convert to Date
    const startDate = new Date(from);
    const endDate = new Date(to);

    // 3️⃣ Nights calculation
    const nights = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    if (nights < 1) {
      req.flash("error", "Minimum booking is 1 night");
      return res.redirect(`/listings/${id}/bookings/book`);
    }

    // 4️⃣ Store booking temporarily in session
    req.session.booking = {
      from,
      to,
      nights
    };

    // 5️⃣ Go to payment page
    res.redirect(`/listings/${id}/bookings/payment`);
  })
);

/**
 * =========================
 * GET → Payment page
 * =========================
 * URL: /listings/:id/bookings/payment
 */
router.get(
  "/payment",
  isloggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = req.session.booking;

    if (!booking) {
      req.flash("error", "Booking session expired");
      return res.redirect(`/listings/${id}/book`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // 💰 PRICE CALCULATION
    const subtotal = booking.nights * listing.price;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    res.render("bookings/payment", {
      listing,
      booking,
      subtotal,
      gst,
      total
    });
  })
);


/**
 * =========================
 * POST → Confirm booking (after payment)
 * =========================
 * URL: /listings/:id/bookings/confirm
 */

router.post(
  "/confirm",
  isloggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = req.session.booking;

    console.log("🔥 CONFIRM ROUTE HIT");

    if (!booking) {
      req.flash("error", "Payment session expired");
      return res.redirect(`/listings/${id}`);
    }

    // 🔴 CHECK CONFLICT AGAIN (CRITICAL)
    const conflict = await Booking.findOne({
      listing: id,
      status: "confirmed",
      $or: [
        {
          startDate: { $lt: new Date(booking.to) },
          endDate: { $gt: new Date(booking.from) }
        }
      ]
    });

    if (conflict) {
      req.flash("error", "This listing is already booked for selected dates");
      return res.redirect(`/listings/${id}/bookings/book`);
    }

    // ✅ CREATE BOOKING
    await Booking.create({
      listing: id,
      user: req.user._id,
      startDate: booking.from,
      endDate: booking.to,
      totalPrice: booking.nights * conflict?.price || booking.nights * 3000,
      status: "confirmed"
    });

    // 🧹 clear session
    delete req.session.booking;

    req.flash("success", "Booking confirmed 🎉");
    return res.redirect(`/listings/${id}`);
  })
);

router.get(
  "/success",
  isloggedIn,
  (req, res) => {
    res.render("bookings/success");
  }
);


module.exports = router;
