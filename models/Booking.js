var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var bookingSchema = new Schema({
    startTime: Date,
    endTime: Date,
    restaurantId: ObjectId,
    uuid: String
});
bookingSchema.index({startTime: 1, endTime: 1})

bookingSchema.plugin(mongoosePaginate);
var Booking = mongoose.model('bookings', bookingSchema);
module.exports = Booking;


