const rideModel = require('../models/rideModel');
const mapService = require('./mapService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { io } = require('../app');


const baseFare = {
    auto: 40, 
    car: 60,  
    moto: 30, 
    parcel: 15
   
};



const perMinuteRate = {
    auto: 3,  
    car: 4,   
    moto: 2,
    parcel: 0.222
    
  
};

const platformfee = {
    auto:3,  
    car: 4,   
    moto: 2, 
    parcel: 1.4 
   
}

// Helper function to emit messages via WebSocket
const sendMessageToSocketId = (socketId, message) => {
    if (socketId) {
        io.to(socketId).emit(message.event, message.data);
    }
};

async function getFinalPrice(pickup, destination, vehicleType) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const perKmRate = {
        auto: distanceTime.distance <= 8 ? 6.97 : 9.605,  
    
        car: distanceTime.distance <= 8 ? 6.97 : 9.605,  
        moto: distanceTime.distance <= 8 ? 6.97 : 9.605, 
        parcel: distanceTime.distance <= 8 ? 6.97 : 9.605
       
    };
    

     return Math.round(platformfee.vehicleType +baseFare.vehicleType + ((distanceTime.distance.value / 1000) * perKmRate.vehicleType) + ((distanceTime.duration.value / 60) * perMinuteRate.vehicleType) );

};





// Calculate fare based on distance and time
async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    const distance = distanceTime[0];
    const time = distanceTime[1];

    const perKmRate = {
        auto: distanceTime.distance <= 8 ? 6.97 : 9.605,  
    
        car: distanceTime.distance <= 8 ? 6.97 : 9.605,  
        moto: distanceTime.distance <= 8 ? 6.97 : 9.605, 
        parcel: distanceTime.distance <= 8 ? 6.97 : 9.605
       
    };
    

    const fare = {
        auto: Math.round(platformfee.auto +baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto) ),
        car: Math.round(platformfee.car + baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        moto: Math.round(platformfee.moto + baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto)),
        parcel: Math.round(platformfee.parcel + baseFare.parcel + ((distanceTime.distance.value / 1000) * perKmRate.parcel) + ((distanceTime.duration.value / 60) * perMinuteRate.parcel)),
    };

    return fare;
}

// Generate OTP
function getOtp(num) {
    const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
    return otp;
}

module.exports.getFare = getFare;

// Create a new ride
module.exports.createRide = async ({ user, pickup, destination, vehicleType }) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType],
        status: 'pending'
    });

    // Notify captains in the area about the new ride
    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
    const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 2);

    captainsInRadius.forEach((captain) => {
        sendMessageToSocketId(captain.socketId, {
            event: 'new-ride',
            data: {
                rideId: ride._id,
                pickup,
                destination,
                vehicleType,
                fare: fare[vehicleType]
            }
        });
    });

    return ride;
};

// Confirm a ride by a captain
module.exports.confirmRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate(
        { _id: rideId },
        { status: 'accepted', captain: captain._id }
    );

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    // Notify the user about the ride confirmation
    sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-confirmed',
        data: ride
    });

    return ride;
};

// Start a ride
module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate(
        { _id: rideId },
        { status: 'ongoing' }
    );

    // Notify the user that the ride has started
    sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-started',
        data: ride
    });

    return ride;
};

// End a ride
module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate(
        { _id: rideId },
        { status: 'completed' }
    );

    // Notify the user that the ride has ended
    sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-ended',
        data: ride
    });

    return ride;
};

module.exports.submitRating = async ({ rideId, ratingType, rating, review }) => {
    if (!rideId || !ratingType || !rating) {
        throw new Error('Ride ID, ratingType, and rating are required');
    }

    // Find the ride
    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    // Update the rating depending on the rating type
    if (ratingType === 'captain') {
        ride.captainRating = { rating, review };
    } else if (ratingType === 'user') {
        ride.customerRating = { rating, review };
    } else {
        throw new Error('Invalid rating type. It must be either "captain" or "user".');
    }

    // Save the updated ride
    await ride.save();

    return ride;
};
