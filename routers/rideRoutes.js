const express = require('express');
const { body, query, validationResult } = require('express-validator');
const rideController = require('../controllers/rideControllr');
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
    '/get-fare',
    [
        query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    ],
    validateRequest,
    rideController.getFare
);

router.post(
    '/confirm',
    [body('rideId').isMongoId().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.confirmRide
);

router.post(
    '/start-ride',
    [
        body('rideId').isMongoId().withMessage('Invalid ride ID'),
        body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    ],
    validateRequest,
    rideController.startRide
);

router.post(
    '/end-ride',
    [body('rideId').isMongoId().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.endRide
);

module.exports = router;
