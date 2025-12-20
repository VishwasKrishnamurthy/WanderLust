const Joi = require('joi');


const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  cost: Joi.number().min(0).required(),
  country: Joi.string().required(),
  location: Joi.string().required(),
image: Joi.array().items(Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required(),
    size: Joi.number().max(5 * 1024 * 1024).required()
  })).optional(),
  category: Joi.string().valid(
    "trending", "rooms", "iconiccities", "castles",
    "amazingpools", "camping", "mountains", "arctic", "farms","trophical","beach","domes","boat"
).required()
}).required();



const reviewSchema = Joi.object({
  rating: Joi.number().min(0).max(5).required(),
  comment: Joi.string().required(),
});

module.exports = { listingSchema, reviewSchema };
