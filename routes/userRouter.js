const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const { signupform, loginform, signuproute, loginroute, logoutroute } = require("../controllers/user");

router.route("/signup")
  .get(signupform)
  .post(wrapAsync(signuproute));

router.route("/login")
  .get(wrapAsync(loginform))
  .post(saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }), loginroute);

router.get("/logout", logoutroute);

module.exports = router;