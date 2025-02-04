const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const rideService = require('../services/rideService');
const { query } = require('express-validator');

router.get('/get-coordinates',
    query('address').isString(),
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString(),
    query('destination').isString(),
    mapController.getDistanceTime
);

router.get('/get-suggestions',
    query('input'),
    mapController.getAutoCompleteSuggestions
);

// New route for fare calculation
router.get('/calculate-fare',
    query('pickup').isString(),
    query('destination').isString(),
    query('vehicleType').isString(),
    async (req, res) => {
        const { pickup, destination } = req.query;
        try {
            const fare = await rideService.getFare(pickup, destination);
            console.log("Fare", fare)
            res.json(fare);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

module.exports = router;
