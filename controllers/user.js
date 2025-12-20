const User = require("../models/user");

module.exports.signuproute = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      return res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.signupform = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.loginform = async (req, res) => {
  res.render("users/login.ejs");
};
module.exports.loginroute= (req, res) => {
  try
  {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
  }
  catch(err)
  {
    req.flash("error", e.message);
    res.redirect("/listings");
    
  }
};

module.exports.logoutroute = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Pass the error to your error handler
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
};

