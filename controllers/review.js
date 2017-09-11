var Review = require('../models/Review');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * POST /review/add
 */
exports.addReview = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('restaurantId', 'RestaurantId cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('comment', 'Comment cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(405).json({'error': errors });
    }

    const review = new Review({
        name: req.body.name,
        email: req.body.email,
        comment: req.body.comment,
        restaurantId: req.body.restaurantId
    });

    review.save(function(err, doc) {
        if(err) {
            return res.status(503).json({'error': err})
        } else {
            return res.json({'success': "Successfully saved you review.",doc})
        }
    });
};


/**
 * Get /review/get/:restaurantId
 * pagination
 */
exports.getReview = function (req,res, next) {
    var options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10
    };

    if(!req.params.restaurantId) {
        Review.paginate({}, options).then(function(reviews) {
            return res.json({'reviews': reviews})
        }).catch(function (err) {
            return res.status(503).json({'error': err})
        });
    } else {
        const restaurantId = req.params.restaurantId.toString()
        if(ObjectId.isValid(restaurantId)){
            var query = { restaurantId : new ObjectId(restaurantId)}

            Review.paginate(query, options).then(function(reviews) {
                return res.json({'reviews': reviews})
            }).catch(function (err) {
                return res.status(503).json({'error': err})
            });
        } else {
            return res.status(405).json({'error': "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"})
        }
    }
}
