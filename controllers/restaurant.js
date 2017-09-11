var Restaurant = require('../models/Restaurant');
var uuidv1 = require('uuid/v1');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * POST /restaurant/add
 */
exports.add = function(req, res) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('address', 'Address cannot be blank').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        return res.status(405).json({'error': errors });
    }
    var restaurant = new Restaurant({
        name : req.body.name,
        address : req.body.address,
        totalCapacity: 0
    });
    restaurant.save(function(err,doc) {
        if(err) {
            return res.status(503).json({'error': err})
        } else {
            return res.json({'success': "Successfully saved your restaurant.", doc})
        }
    });
};

/**
 * DELETE /restaurant/remove
 */
exports.remove = function(req, res) {
    req.assert('restaurantId', 'restaurantId cannot be blank').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(405).json({'error': errors });
    }
    Restaurant.findOneAndRemove({'_id': new ObjectId(req.body.restaurantId.toString())}, function(err, doc){
        if(err) {
            return res.status(503).json({'error': err})
        } else {
            return res.json({'success': "Successfully deleted your restaurant.",doc})
        }
    })
};


/**
 * GET /restaurant/search
 */
exports.searchRestaurant = function(req, res) {
    if(req.query.capacity) {

        var capacity = req.query.capacity
        Restaurant.find({totalCapacity: {$gt: capacity}}, function (error,result) {
            if(error) {
                return res.status(503).json({error})
            } else {
                return res.json({result})
            }
        }).sort({ratio: 1}).limit(10);
    } else {
        // search via name or address
        if(!req.query.name && !req.query.address) {
            return res.status(403).json({'error':'name or address not passed!'})
        }
        var prioritySearch = req.query.name +' '+ req.query.address
        Restaurant.find({$text: {$search: prioritySearch}}, function (error, restaurants) {
            return res.json({restaurants})
        })
    }
};


/**
 * POST /restaurant/table/add
 */
exports.addTable = function(req, res) {
    req.assert('capacity', 'Capacity cannot be blank or non integer').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(405).json({'error': errors });
    }
    Restaurant.findById(req.body.restaurantId, (err, restaurant) => {
        if (err) {
            res.status(500).json({'error':err});
        } else {
            if(restaurant === null) res.status(503).json({'error': 'Restaurant not found!'})
            else {
                // add table
                var uuidTable = uuidv1();
                var prevTables = restaurant.tables
                prevTables.unshift({uuid: uuidTable, capacity:req.body.capacity})
                restaurant.tables = prevTables

                // update values
                restaurant.save((error, restaurantTable) => {
                    if (error) {
                        res.status(500).json({error})
                    }
                    return res.status(200).json({
                        restaurantTable,
                        success: "Successfully updated tables in restaurant!"
                    });
                });
            }
        }
    });
};

/**
 * PUT /restaurant/table/update
 */
exports.updateTable = function(req, res) {
    req.assert('capacity', 'Capacity cannot be blank or non integer').notEmpty();
    req.assert('restaurantId', 'Capacity cannot be blank or non integer').notEmpty();
    req.assert('tableuuid', 'Capacity cannot be blank or non integer').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(405).json({'error': errors });
    }
    Restaurant.findById(req.body.restaurantId, (err, restaurant) => {
        if (err) {
            res.status(500).json({'error':err});
        } else {
            if(restaurant === null) res.status(503).json({'error': 'Restaurant not found!'})
            else {
                try {
                    // update table capacity
                    var newTables = restaurant.tables.map((item)=> {
                            if(item.uuid === req.body.tableuuid) {
                            item.capacity = parseInt(req.body.capacity)
                        }
                        return item
                    })
                    restaurant.tables = newTables

                    // update values
                    restaurant.save((error, restaurantTable) => {
                        if (error) {
                            res.status(500).json({error})
                        }
                        return res.status(200).json({
                            restaurantTable,
                            success: "Successfully updated table capacity!"
                        });
                    });
                } catch (error) {
                    return res.status(500).json({'error': error.toString()})
                }
            }
        }
    });
};


/**
 * DELETE /restaurant/table/remove
 */
exports.removeTable = function(req, res) {
    req.assert('uuid', 'uuid cannot be blank or non integer').notEmpty();
    req.assert('restaurantId', 'restaurantId cannot be blank or non integer').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(405).json({'error': errors });
    }
    Restaurant.findById(req.body.restaurantId, (err, restaurant) => {
        if (err) {
            res.status(500).json({'error':err});
        } else {
            if(restaurant === null) res.status(503).json({'error': 'Restaurant not found!'})
            else {
                // remove table
                var istable = restaurant.tables.filter((item)=> item.uuid === req.body.uuid);
                if(istable.length === 0) return res.status(403).json({'error': `Table with uuid '${req.body.uuid}' not found!`})
                var newtables = restaurant.tables.filter((item)=> item.uuid !== req.body.uuid);
                restaurant.tables = newtables;

                // update values
                restaurant.save((error, restaurantTable) => {
                    if (error) {
                        res.status(500).json({error})
                    }
                    return res.status(200).json({
                        restaurantTable,
                        success: `Successfully removed table with uuid ${req.body.uuid}!`
                    });
                });
            }
        }
    });
};