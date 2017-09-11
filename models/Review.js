var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = require('mongoose').Types.ObjectId;

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var reviewSchema = new mongoose.Schema({
    name: String,
    email: String,
    comment: String,
    restaurantId: ObjectId,
}, schemaOptions);
reviewSchema.plugin(mongoosePaginate);

var Review = mongoose.model('review', reviewSchema);
module.exports = Review;
