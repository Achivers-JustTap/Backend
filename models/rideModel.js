const mongoose = require('mongoose');


const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },

    vehicleType: {
        type: String,
        enum: ['auto', 'car', 'moto', 'parcel'],
        required: true,
    },

    BookingAceptedTime: {
        type: String ,     
        
    },

    StartTime:{
        type: String ,   
    },
    EndTime:{
        type: String ,   
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', "ongoing", 'completed', 'cancelled'],
        default: 'pending',
    },
 
    
   
    captainFare:{
        type: Number,
    },

    baseFare: {
        type: Number,
        required: true,
    },
    distanceCost: {
        type: Number,
        required: true,
    },
    minuteCost: {
        type: Number,
        required: true,
    },
    waitingCost: {
        type: Number,
    },
    platFormFee: {
        type: Number,
        required: true,

    },
    longPickupCost: {
        type: Number,

    },
    cancellationCost: {
        type: Number,
    },
    surgeCost: {
        type: Number,

    },
    nightFareCost: {
        type: Number,

    },

    Gst:{
        type: Number,
        required: true,   
    },

    commission: {
        type: Number,
        required: true,
    },
    handlingFee:{
        type: Number,
        required: true,
    },

    justTapFee:{
        type: Number,
    },
   
    duration: {
        type: Number,
    }, // in seconds

    distance: {
        type: Number,
    }, // in meters

    paymentID: {
        type: String,
    },
    paymentType:{
        type: String,
        enum: ['cash', 'online'],
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },

    otp: {
        type: String,
        select: false,
        required: true,
    },

    customerRating: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: {
            type: String,
            trim: true
        }
    },
    captainRating: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: {
            type: String,
            trim: true
        }
    }
})

module.exports = mongoose.model('ride', rideSchema);