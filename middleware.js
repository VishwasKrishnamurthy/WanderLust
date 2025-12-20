const listing=require("./models/listing");
const ExpressError=require('./utils/expressError.js');
const {listingSchema} =require('./schema.js');
const {reviewSchema} =require('./schema.js');
const review=require('./models/review.js');

const isloggedIn=(req,res,next)=>
{   
    
    if(!req.isAuthenticated())
    {   
        console.log(req.originalUrl
        );
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must login first");
        return res.redirect("/login");
    }
    next();
};
module.exports=isloggedIn;
module.exports.saveRedirectUrl=(req,res,next)=>
{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner=async (req,res,next)=>
{   
    const { id } = req.params;
    let curlisting=await listing.findById(id);
    if(!curlisting.owner._id.equals(res.locals.curUser._id))
    {
      req.flash("error","You are not the owner");
      return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateListing = (req, res, next) => {
    console.log(req.body);
    const { error } = listingSchema.validate(req.body);
    if (error) {
      throw new ExpressError(400, error.details[0].message);
    }
    next();
  };

  module.exports.validateReview= (req, res, next) => {
    console.log(req.body);
     const { error } = reviewSchema.validate(req.body );
     if (error) {
       throw new ExpressError(400, error.details[0].message);
     }
     next();
   };
   module.exports.isAuthor=async (req,res,next)=>
   {
     const {id,reviewid}=req.params;
     const curreview=await review.findById(reviewid);
     if(!curreview.author._id.equals(res.locals.curUser._id))
      {
        req.flash("error","You are not the author of the review");
        return res.redirect(`/listings/${id}`);
      }
      next();
   }