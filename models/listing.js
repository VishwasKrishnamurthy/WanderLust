const mongoose = require('mongoose');
const review = require('./review');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: [
        {   
            filename: {
                type: String,
             
            },
            url: {
                type: String,
            },
            _id: false, 
        }
    ],
    price: {
        type: String,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
   
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    },
    category:
    {
       type:String,
       enum:["trending","rooms","iconiccities","castles","amazingpools","camping","mountains","arctic","farms","beach","tropical","domes","boat"],
    }
});


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const listing = mongoose.model("Listing", listingSchema);

module.exports = listing;
