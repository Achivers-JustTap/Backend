const express = require('express');
const { body, query, validationResult } = require('express-validator');
const rideController = require('../controllers/rideController');
const router = express.Router();

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post(
    '/create',
    [
        body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
        body('vehicleType').isString().isIn(['auto', 'car', 'moto']).withMessage('Invalid vehicle type'),
    ],
    validateRequest,
    rideController.createRide
);

router.get(
    '/get-final-price',
    [
        query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
        query('vehicleType').isString().isIn(['auto', 'car', 'moto','parcel']).withMessage('Invalid vehicle type'),
    ],
    validateRequest,
    rideController.getFinalPrice
);
router.get(
    '/ratecard',
    [query('vehicleType').isString().isIn(['auto', 'car', 'moto','parcel']).withMessage('Invalid vehicle type')],
    rideController.getRateCard
);

router.get(
    '/get-fare',
    [
        query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    ],
    validateRequest,
    rideController.getFare
);

router.post(
    '/accept-ride',
    [
        body('rideId').isMongoId().withMessage('Invalid ride ID'),
        body('captainId').isMongoId().withMessage('Invalid captain ID'),
    ],
    validateRequest,
    rideController.acceptRide
);


router.post(
    '/confirm',
    [ 
        body('rideId').isMongoId().withMessage('Invalid ride ID'),
        body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    ],
    validateRequest,
    rideController.confirmRide
);

// router.post(
//     '/start-ride',
//     [
//         body('rideId').isMongoId().withMessage('Invalid ride ID'),
//         body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
//     ],
//     validateRequest,
//     rideController.startRide
// );

router.post(
    '/end-ride',
    [body('rideId').isMongoId().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.endRide
);

router.post(
    '/rate',
    [
        body('rideId').isMongoId().withMessage('Invalid ride ID'),
        body('givenBy').isMongoId().withMessage('Invalid user ID'),
        body('ratedFor').isMongoId().withMessage('Invalid rated user ID'),
        body('ratingType').isString().isIn(['captain', 'user']).withMessage("Invalid ratingType. Use 'captain' or 'customer'."),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('review').optional().isString().withMessage('Review must be a string'),
    ],
    validateRequest,
    rideController.submitRating
);

router.get('/captain-rating/:captainId', async (req, res) => {
    try {
        const { captainId } = req.params;

        const rides = await Ride.find({ captain: captainId, 'captainRating.rating': { $exists: true } });

        if (rides.length === 0) {
            return res.json({ averageRating: 0, totalReviews: 0 });
        }

        const totalReviews = rides.length;
        const averageRating = rides.reduce((sum, ride) => sum + ride.captainRating.rating, 0) / totalReviews;

        res.json({ averageRating, totalReviews });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/customer-rating/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const rides = await Ride.find({ user: customerId, 'customerRating.rating': { $exists: true } });

        if (rides.length === 0) {
            return res.json({ averageRating: 0, totalReviews: 0 });
        }

        const totalReviews = rides.length;
        const averageRating = rides.reduce((sum, ride) => sum + ride.customerRating.rating, 0) / totalReviews;

        res.json({ averageRating, totalReviews });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;