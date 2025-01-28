const { validationResult } = require('express-validator');
const rideService = require('../services/rideService');
const mapService = require('../services/mapService');
const { io } = require('../app'); // Import the io instance

// Emit event to socket ID
const sendMessageToSocketId = (socketId, message) => {
    if (socketId) {
        io.to(socketId).emit(message.event, message.data);
    }
};

module.exports = {
    // Get fare based on pickup and destination
    getFare: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pickup, destination } = req.query;

        try {
            const fare = await rideService.getFare(pickup, destination);
            res.status(200).json({ message: 'Fare calculated successfully', fare });
        } catch (err) {
            console.error('Error calculating fare:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Create a new ride
    createRide: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, pickup, destination, vehicleType } = req.body;

        try {
            const ride = await rideService.createRide({ user: userId, pickup, destination, vehicleType });

            // Notify captains
            const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
            const captainsInRadius = await mapService.getCaptainsInTheRadius(
                pickupCoordinates.ltd,
                pickupCoordinates.lng,
                2
            );

            captainsInRadius.forEach((captain) => {
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: {
                        rideId: ride._id,
                        pickup,
                        destination,
                        vehicleType,
                    },
                });
                console.log("Ride Booked ",ride._id,
                    pickup,
                    destination,
                    vehicleType)
            });

            res.status(201).json({ message: 'Ride created successfully', ride });
        } catch (err) {
            console.error('Error creating ride:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Confirm a ride
    confirmRide: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId } = req.body;

        try {
            const ride = await rideService.confirmRide({ rideId, captain: req.captain });

            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-confirmed',
                data: ride,
            });

            res.status(200).json(ride);
        } catch (err) {
            console.error('Error confirming ride:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Start a ride
    startRide: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId, otp } = req.body;

        try {
            const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-started',
                data: ride,
            });

            res.status(200).json(ride);
        } catch (err) {
            console.error('Error starting ride:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // End a ride
    endRide: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId } = req.body;

        try {
            const ride = await rideService.endRide({ rideId, captain: req.captain });

            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-ended',
                data: ride,
            });

            res.status(200).json(ride);
        } catch (err) {
            console.error('Error ending ride:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};
