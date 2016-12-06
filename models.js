const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const restaurantSchema = mongoose.Schema({
  name: String,
  restaurant_id: String,
  borough: {type: String, required: true},
  cuisine: String,
  address: {
    building: String,
    coord: [String],
    street: String,
    zipcode: String
  },
  grades: [{
    date: Date,
    grade: String,
    score: Number
  }]
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = {Restaurant};
