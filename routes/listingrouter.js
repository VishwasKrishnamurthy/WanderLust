const { storage } = require("../cloud-config.js");
const multer  = require('multer')
const upload = multer({storage})
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const isloggedIn = require("../middleware.js");
const { isOwner } = require("../middleware.js");
const { validateListing } = require("../middleware.js");
const {
  index,
  newcallback,
  createlisting,
  showlisting,
  editlisting,
  updatelisting,
  deletelisting,
  deleteimage,
} = require("../controllers/listings.js");




router.get("/", wrapAsync(index));

router.get("/new", isloggedIn, newcallback);




router.get("/:id", wrapAsync(showlisting));
router.get("/:id/edit", isloggedIn, isOwner, wrapAsync(editlisting));
router.post("/create", upload.array('image'), isloggedIn, validateListing, wrapAsync(createlisting));  // Order is important here
router.put("/:id", upload.array('image'), isloggedIn, isOwner, wrapAsync(updatelisting));  // Same here


router.post("/:id/delete", isloggedIn, isOwner, wrapAsync(deletelisting));




module.exports = router;
