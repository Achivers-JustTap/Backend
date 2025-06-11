const { validationResult } = require('express-validator');
const rideService = require('../services/rideService');
const mapService = require('../services/mapService');
const rideModel = require('../models/rideModel');
const {sendMessageToSocketId} = require('../socket');
const { io } = require('../app'); // Import the io instance

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
            console.log('Ride created:', ride);

            // Notify captains
            const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
            console.log('Pickup coordinates:', pickupCoordinates);

            const captainsInRadius = await mapService.getCaptainsInTheRadius(
                pickupCoordinates.lat,
                pickupCoordinates.lng,
                2
            );
           

            console.log('captain:', captainsInRadius,'ride:',ride);
            ride.otp = ""

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');
        const pickupToDestination = await mapService.getDistanceTime(pickup, destination);

        for (const captain of captainsInRadius) {
            if (captain.socketId) {
                const captainLocation = `${captain.location.coordinates[1]},${captain.location.coordinates[0]}`;
                const captainToPickup = await mapService.getDistanceTime(captainLocation, pickup);

                // Convert Mongoose document to plain object
                const rideData = rideWithUser.toObject();

                // Add additional fields
                rideData.pickupToDestination = pickupToDestination;
                rideData.captainToPickup = captainToPickup;

                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideData
                });
            } else {
                console.warn(`Captain with id ${captain._id} has no socketId, skipping notification.`);
            }
        }
            res.status(201).json({ message: 'Ride created successfully', ride });
        } catch (err) {
            console.error('Error creating ride:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // accepted ride

acceptRide: async (req, res) => {
    const { rideId, captainId } = req.body;

    try {
        // Check if captain already has an accepted or ongoing ride
        const existingRide = await rideModel.findOne({
            captain: captainId,
            status: { $in: ['accepted', 'ongoing'] }
        });

        if (existingRide) {
            return res.status(400).json({ message: 'Captain already has an accepted or ongoing ride' });
        }

        const ride = await rideModel.findById(rideId).select('+otp');
        console.log('Ride found:', ride); // Debugging ride output

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status === 'accepted') {
            return res.status(400).json({ message: 'Ride already accepted' });
        }

        ride.status = 'accepted';
        ride.captain = captainId;

        await ride.save();

        // Notify the user that the ride has been accepted
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-accepted',
            data: ride
        });

        // Notify other captains to remove this ride from their list
        const pickupCoordinates = await mapService.getAddressCoordinate(ride.pickup);
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.lat,
            pickupCoordinates.lng,
            2
        );

        for (const captain of captainsInRadius) {
            if (captain._id.toString() !== captainId && captain.socketId) {
                sendMessageToSocketId(captain.socketId, {
                    event: 'ride-removed',
                    data: { rideId: ride._id }
                });
            }
        }

        res.status(200).json({ message: 'Ride accepted successfully', ride });
    } catch (err) {
        console.error('Error accepting ride:', err.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
},


    // Confirm a ride
    confirmRide: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId, otp } = req.body;

        try {
            console.log('ConfirmRide request body:', req.body); // Debugging input

            const ride = await rideService.confirmRide({ rideId, otp, captain: req.captain });
            console.log('Ride returned from rideService.confirmRide:', ride); // Debugging ride output

            if (!ride) {
                console.error('Ride not found for rideId:', rideId); // Debugging missing ride
                return res.status(404).json({ message: 'Ride not found' });
            }

            if (!ride._id) {
                console.error('Ride object is missing _id:', ride); // Debugging missing _id
                return res.status(500).json({ message: 'Ride object is invalid' });
            }

            // Ensure ride.user is populated
            const populatedRide = await rideModel.findById(ride._id).populate('user');
            console.log('Populated ride:', populatedRide); // Debugging populated ride

            if (!populatedRide || !populatedRide.user) {
                console.error('User not found for ride:', populatedRide); // Debugging missing user
                return res.status(404).json({ message: 'User associated with the ride not found' });
            }

            sendMessageToSocketId(populatedRide.user.socketId, {
                event: 'ride-confirmed',
                data: populatedRide,
            });

            res.status(200).json(populatedRide);
        } catch (err) {
            console.error('Error confirming ride:', err.message, err.stack); // Debugging error
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Start a ride
    // startRide: async (req, res) => {
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //     }

    //     const { rideId, otp } = req.body;

    //     try {
    //         const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

    //         sendMessageToSocketId(ride.user.socketId, {
    //             event: 'ride-started',
    //             data: ride,
    //         });

    //         res.status(200).json(ride);
    //     } catch (err) {
    //         console.error('Error starting ride:', err.message);
    //         res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },

    // End a ride
    endRide: async (req, res) => {
        try {
            const { rideId } = req.body;

            // Validate input
            if (!rideId) {
                return res.status(400).json({ error: "Ride ID is required" });
            }

            // Call service to end ride
            const result = await rideService.endRide(rideId); // Ensure this is awaited

            res.status(200).json(result); // Send success response
        } catch (error) {
            console.error("Error ending ride:", error);

            // Handle specific error messages
            if (error.message === "Ride not ongoing") {
                return res.status(400).json({ error: "The ride is not currently ongoing." });
            } else if (error.message === "Ride not found") {
                return res.status(404).json({ error: "Ride not found." });
            }

            res.status(500).json({ error: "Internal server error" });
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