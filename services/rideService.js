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



module.exports.getFinalPrices = (pickup, destination, vehicleType) => {
    if (!pickup || !destination || !vehicleType) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime =  mapService.getDistanceTime(pickup, destination);

    const perKmRate = {
        auto: distanceTime.distance <= 8 ? 6.97 : 9.605,  
    
        car: distanceTime.distance <= 8 ? 6.97 : 9.605,  
        moto: distanceTime.distance <= 8 ? 6.97 : 9.605, 
        parcel: distanceTime.distance <= 8 ? 6.97 : 9.605
       
    };
    console.log(" distanceTime",distanceTime,"vehicletype",vehicleType,"pickup",pickup,"destination",destination,"perkmrate",perKmRate[vehicleType],"basefare",baseFare[vehicleType],"perminrate",perMinuteRate)

     return distanceTime.distance * perKmRate[vehicleType] + distanceTime.time * perMinuteRate[vehicleType] + platformfee[vehicleType] + baseFare[vehicleType]

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
    auto: (platformfee.auto + baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)).toFixed(2),
    car: (platformfee.car + baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)).toFixed(2),
    moto: (platformfee.moto + baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto)).toFixed(2),
    parcel: (platformfee.parcel + baseFare.parcel + ((distanceTime.distance.value / 1000) * perKmRate.parcel) + ((distanceTime.duration.value / 60) * perMinuteRate.parcel)).toFixed(2),
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

    // done by charitha: get distance and time from mapService
    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    const distanceInKm = distanceTime.distance.value / 1000;
    const durationInMin = distanceTime.duration.value / 60;

    // done by charitha: calculate costs based on vehicleType
    const baseFareValue = baseFare[vehicleType];
    const distanceCost = distanceInKm * (distanceTime.distance <= 8 ? 6.97 : 9.605);
    const minuteCost = durationInMin * perMinuteRate[vehicleType];
    const platFormFee = platformfee[vehicleType];
    const commission = 0.1 * (baseFareValue + distanceCost + minuteCost); // example 10% commission
    const Gst = 0.18 * (baseFareValue + distanceCost + minuteCost); // example 18% GST
    const handlingFee = 5; // example fixed handling fee

    const fare = (baseFareValue + distanceCost + minuteCost + platFormFee + commission + Gst + handlingFee).toFixed(2); // total fare

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        vehicleType, // done by charitha: include vehicleType
        baseFare: baseFareValue, // done by charitha
        distanceCost, // done by charitha
        minuteCost, // done by charitha
        platFormFee, // done by charitha
        commission, // done by charitha
        Gst, // done by charitha
        handlingFee, // done by charitha
        fare, // done by charitha
        otp: getOtp(6),
        status: 'pending'
    });

    // Notify captains in the area about the new ride
    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

    // Find captains in radius
    let captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 2);

    // Filter out captains who already have an accepted or ongoing ride
    const busyCaptains = await rideModel.find({
        captain: { $in: captainsInRadius.map(c => c._id) },
        status: { $in: ['accepted', 'ongoing'] }
    }).distinct('captain');

    captainsInRadius = captainsInRadius.filter(captain => !busyCaptains.includes(captain._id));


    return ride;
};

// Confirm a ride by a captain
module.exports.confirmRide = async ({ rideId, otp, captain }) => {
    try {
        console.log('confirmRide called with:', { rideId, otp, captain }); // Debugging input

        const ride = await rideModel.findById(rideId).select('+otp');
        console.log('Ride fetched from database:', ride); // Debugging fetched ride

        if (!ride) {
            console.error('Ride not found for rideId:', rideId); // Debugging missing ride
            return null;
        }

        if (ride.otp !== otp) {
            console.error('Invalid OTP for ride:', { rideId, providedOtp: otp, expectedOtp: ride.otp }); // Debugging OTP mismatch
            throw new Error('Invalid OTP');
        }

        ride.status = 'accepted';
        ride.captain = captain;

        await rideModel.findOneAndUpdate(
        { _id: rideId },
        { status: 'ongoing' }
    );

        const updatedRide = await ride.save();
        console.log('Ride updated and saved:', updatedRide); // Debugging updated ride

        return updatedRide;
    } catch (err) {
        console.error('Error in confirmRide:', err.message, err.stack); // Debugging error
        throw err;
    }
};

module.exports.endRide = async function (rideId) {
    try {
        const ride = await rideModel.findById(rideId);
        if (!ride) {
            throw new Error("Ride not found");
        }

        // Check if the ride is ongoing
        if (ride.status !== "ongoing") {
            throw new Error("Ride not ongoing");
        }

        // Logic to end the ride
        ride.status = "completed";
        await ride.save();

        return { success: true, message: "Ride ended successfully" };
        console.log("Ride ended successfully");
    } catch (error) {
        console.error("Error in endRide service:", error);
        throw error;
    }
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
