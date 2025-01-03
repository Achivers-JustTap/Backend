const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { query } = require('express-validator');

router.get('/get-coordinates',
    query('address').isString().isLength({ min: 3 }),
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input'),
    mapController.getAutoCompleteSuggestions
)



module.exports = router;