var Booking = require('../models/Booking');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * POST /booking/add
 */
exports.book  = function (req, res, next) {
    req.assert('startTime', 'startTime cannot be blank').notEmpty();
    req.assert('endTime', 'endTime cannot be blank').notEmpty();
    req.assert('restaurantId', 'restaurantId cannot be blank').notEmpty();
    req.assert('tableuuid', 'tableuuid cannot be blank').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(405).json({'error': errors });
    }
    var startTime = new Date(req.body.startTime)
    var endTime = new Date(req.body.endTime)
    var booking = new Booking({
        startTime ,
        endTime,
        restaurantId: req.body.restaurantId,
        uuid: req.body.tableuuid
    });

    // search mongo
    Booking.find({ $or: [
        { startTime : { $lte: startTime }, endTime : { $gte: endTime } },
    ]},function (error,docs) {
        if(error) {
            return res.json({error})
        }
        // no conflicting timings
        if(docs.length === 0) {
            // save new slots
            booking.save(function(err,doc) {
                if(err) {
                    return res.status(503).json({'error': err})
                } else {
                    return res.json({'success': "Successfully booked for your restaurant.", doc})
                }
            });
        } else {
            return res.status(405).json({error: 'Someone has already booked the tables for the time range!', docs})
        }
    });
}


/**
 * DELETE /booking/cancel
 */
exports.cancelBooking  = function (req, res, next) {
    // req.assert('userId', 'restaurantId cannot be blank').notEmpty();
    req.assert('restaurantId', 'restaurantId cannot be blank').notEmpty();
    req.assert('tableuuid', 'tableuuid cannot be blank').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(405).json({'error': errors });
    }
    var query = {
        'restaurantId': new ObjectId(req.body.restaurantId.toString()),
        'uuid': req.body.tableuuid
    }
    Booking.findOneAndRemove(query, function(error, doc){
        if(error) {
            return res.status(503).json({error})
        } else {
            return res.json({'success': "Successfully canceled your booking.",doc})
        }
    })
}


/**
 * GET /booking/:restaurantId
 */
exports.getBookings  = function (req, res, next) {
    var options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10
    };

    if(!req.params.restaurantId) {
        Booking.paginate({}, options).then(function(booking) {
            return res.json({'bookings': booking})
        }).catch(function (err) {
            return res.status(503).json({'error': err})
        });
    } else {
        const restaurantId = req.params.restaurantId.toString()
        if(ObjectId.isValid(restaurantId)){
            var query = { restaurantId : new ObjectId(restaurantId)}
            // query helpers for starTime and endTime
            if(req.query.startTime && req.query.endTime) {
                query = {
                    restaurantId: new ObjectId(restaurantId),
                    $or: [{startTime: {$lte: req.query.startTime}, endTime: {$gte: req.query.endTime}},
                    ]
                }
            }
            Booking.paginate(query, options).then(function(booking) {
                return res.json({'bookings': booking})
            }).catch(function (err) {
                return res.status(503).json({'error': err})
            });
        } else {
            return res.status(405).json({'error': "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"})
        }
    }
}

