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
    getFinalPrice:  (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { pickup, destination , vehicleType } = req.query;

        try {
            const fare =  rideService.getFinalPrices(pickup, destination,vehicleType);
            res.status(200).json({ message: 'Fare calculated successfully', fare:fare });
        } catch (err) {
            console.error('Error calculating fare:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
         
    },

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
    getRateCard:(req , res) => {
        const {vehicleType} = req.query
        console.log("Vehicle Type",vehicleType);
        const ratecardbike = {
            Basefare:10,
            Distancefare1:6.97,
            distancefare2:9.605,
            Minutecost:0.222,
            Waitingchargecost:1,
            Platformfee:1.4,
            Longpickup:4,
            Cancellationfee:"0-10",
            Surgefare:10,
            Nightfare:25,
            Justtapcommision:11
            

        }
        const ratecardauto = {
            Basefare:20,
            Distancefare1:6.97,
            distancefare2:9.605,
            Minutecost:0.222,
            Waitingchargecost:1,
            Platformfee:1.4,
            Longpickup:4,
            Cancellationfee:"0-10",
            Surgefare:10,
            Nightfare:25,
            Justtapcommision:11
            
        }
        const ratecardcar = {
            Basefare:30,
            Distancefare1:6.97,
            distancefare2:9.605,
            Minutecost:0.222,
            Waitingchargecost:1,
            Platformfee:1.4,
            Longpickup:4,
            Cancellationfee:"0-10",
            Surgefare:10,
            Nightfare:25,
            Justtapcommision:11
            
        }
        const ratecardparcel = {
            Basefare:30,
            Distancefare1:6.97,
            distancefare2:9.605,
            Minutecost:0.222,
            Waitingchargecost:1,
            Platformfee:1.4,
            Longpickup:4,
            Cancellationfee:"0-10",
            Surgefare:10,
            Nightfare:25,
            Justtapcommision:11
            
        }

        let result; 
        switch(vehicleType){
            case 'car' : result = ratecardcar; break;
            case 'moto' : result = ratecardbike;break;
            case 'auto' : result = ratecardauto;break;
            case 'parcel': result = ratecardparcel;break;
            default: result = "Provide Specific Vehicle Type "
        }

       
        res.status(200).json({ message: 'Fare calculated successfully', rateCard:result });

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

module.exports.submitRating = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, givenBy, ratedFor, ratingType, rating, review } = req.body;

    try {
        
        const ride = await rideService.findRideById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ratingType === 'captain') {
            ride.captainRating = { rating, review };
        } else if (ratingType === 'user') {
            ride.customerRating = { rating, review };
        }

       
        await ride.save();

       
        if (ratingType === 'captain') {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'captain-rating-submitted',
                data: { rideId, rating, review },
            });
        } else {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'customer-rating-submitted',
                data: { rideId, rating, review },
            });
        }

        res.status(200).json({ message: 'Rating submitted successfully', ride });
    } catch (err) {
        console.error('Error submitting rating:', err.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};