const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { query } = require('express-validator');

router.get('/get-coordinates',
    query('address').isString(),
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString(),
    query('destination').isString(),
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input'),
    mapController.getAutoCompleteSuggestions
)



module.exports = router;