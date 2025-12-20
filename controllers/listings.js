const listing = require("../models/listing");

const { cloudinary } = require("../cloud-config.js");


module.exports.index = async (req, res, next) => {
    try {
      let filter = {}; 
  
      // Log the search query to check if it's being passed correctly
      console.log("Search Query:", req.query.query);
  
      // If a category filter is present
      if (req.query.category) {
        filter.category = req.query.category.toLowerCase();
      }
  
      // If there's a search query, filter by title or location
      if (req.query.query) {
        const regex = new RegExp(req.query.query, 'i'); // Case-insensitive regex for search
        filter.$or = [
          { title: regex },  // Search by title
          { location: regex } // Search by location
        ];
      }
  
      // Fetch filtered results
      const result = await listing.find(filter);
      console.log("Filtered Results:", result);
  
      // If no results found, pass a message
      const message = result.length === 0 ? "No search results found" : null;
  
      res.render("listings/index.ejs", { result, message });
    } catch (err) {
      next(err);
    }
  };
  
  

module.exports.newcallback = (req, res) => {
    res.render("listings/new.ejs");
};
module.exports.createlisting = async (req, res, next) => {
    try {
        // Handle multiple image uploads only if files exist
        let imagesArray = [];
       
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, { folder: 'wanderlust_DEV' })
            );
            const imageResults = await Promise.all(imagePromises);

            imagesArray = imageResults.map(result => ({
                filename: result.public_id,
                url: result.secure_url,
            }));
        }
        else
         {
            
            imagesArray = [{
                filename: 'default_image',  
                url: 'https://img.freepik.com/premium-vector/home-stay-logo-design_626969-144.jpg', 
            }];
        }

       
        
        const newListing = new listing({
            title: req.body.title,
            description: req.body.description,
            image: imagesArray,
            price: req.body.cost,
            location: req.body.location,
            country: req.body.country,
            category: req.body.category.toLowerCase(), 
            owner: req.user._id,
        });
        
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
        
    } catch (err) {
        next(err);
    }
};




module.exports.showlisting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await listing
            .findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");

        if (!result) {
            req.flash("error", "Listing you requested doesn't exist");
            return res.redirect("/listings"); // Ensure a return here
        }
        console.log(result);
        res.render("listings/show.ejs", { result });
    } catch (err) {
        next(err); // Pass error to global error handler
    }
};

module.exports.editlisting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await listing.findById(id);

        if (!result) {
            req.flash("error", "Listing you requested doesn't exist");
            return res.redirect("/listings"); // Ensure a return here
        }

        res.render("listings/edit.ejs", { result });
    } catch (err) {
        next(err); // Pass error to global error handler
    }
};


module.exports.updatelisting = async (req, res, next) => {
    try {
        console.log("req.body:", req.body);  // Debug log for form data
        console.log("req.files:", req.files);  // Debug log for file uploads

        const { id } = req.params;
        const listingData = await listing.findById(id);

        if (!listingData) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        
        const existingImages = listingData.image || [];
        let updatedImages = [...existingImages];

        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, { folder: 'wanderlust_DEV' })
            );
            const imageResults = await Promise.all(imagePromises);

            updatedImages = [
                ...updatedImages,
                ...imageResults.map(result => ({
                    filename: result.public_id,
                    url: result.secure_url,
                })),
            ];
        }

        const updateData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.cost,
            location: req.body.location,
            country: req.body.country,
            image: updatedImages,
            
        };

        const updatedListing = await listing.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedListing) {
            req.flash("error", "Failed to update listing");
            return res.redirect(`/listings/${id}/edit`);
        }

        req.flash("success", "Listing Updated Successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("Error updating listing:", err);  // Debug log for errors
        next(err);  // Pass the error to the global error handler
    }
};
module.exports.deletelisting = async (req, res, next) => {
    try {
        const { id } = req.params;
        await listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted !");
        res.redirect("/listings");
    } catch (err) {
        next(err); 
    }
};