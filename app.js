if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
   console.log('Environment: Development');
 } else {
   console.log('Environment: Production');
 }
 
 const express = require('express');
 const app = express();
 const mongoose = require('mongoose');
 const path = require("path");
 const methodOverride = require('method-override');
 const ejsMate = require("ejs-mate");
 const ExpressError = require('./utils/expressError.js');
 const listingsRouter = require('./routes/listingrouter.js');
 const reviewsRouter = require('./routes/reviewrouter.js');
 const userRouter = require('./routes/userRouter.js');
 const session = require("express-session");
 const MongoStore = require('connect-mongo');
 const flash = require("connect-flash");
 const passport = require("passport");
 const LocalStrategy = require("passport-local");
 const User = require("./models/user.js");
 
 
 
 app.engine('ejs', ejsMate);
 app.use(methodOverride("_method"));
 app.use(require('cookie-parser')());
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 app.use(express.static(path.join(__dirname, "/public")));
 app.set("view engine", "ejs");
 app.set("views", path.join(__dirname, "views"));
 
const store= MongoStore.create({
   crypto: {
      secret: process.env.SECRET,
   },
   touchAfter: 24*60*60,
   mongoUrl: process.env.MONGO_URI
});
store.on("error", function(e){
   console.log("Session Store Error", e);
});

 const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
 }; 

 
 app.use(session(sessionOptions));
 app.use(flash());
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));
 
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());
 
 mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
 
 app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    next();
 });
 app.get('/', (req, res) => {
  res.redirect('/listings');
});

 app.use("/listings", listingsRouter);
 app.use("/listings/:id/reviews", reviewsRouter);
 app.use("/", userRouter);
 
 app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
 });
 
 app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const { statuscode = 500, message = "Something went wrong" } = err;
    res.status(statuscode).render("error.ejs", { message });
 });
 
 const PORT = process.env.PORT || 8080;
 app.listen(PORT, () => {
    console.log(`Server listening on the port: ${PORT}`);
 });
