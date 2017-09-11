var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var restaurantSchema = new Schema({
    email: String,
    name: String,
    address: String,
    totalCapacity: Number,
    tables: [
        { uuid: String, capacity: Number }
      ]
}, schemaOptions);

restaurantSchema.pre('save', function(next) {
    var restaurant = this;
    if (!restaurant.isModified('tables')) { return next(); }
    else {
        // update totalCapacity
        var totalCapacity = restaurant.tables.reduce(function(acc, currVal) {
            return acc + parseInt(currVal.capacity);
        },0);
        restaurant.totalCapacity = totalCapacity
        next()
    }
});

restaurantSchema.index({ name: 'text', address: 'text' })
var Restaurant = mongoose.model('restaurants', restaurantSchema);
module.exports = Restaurant;
