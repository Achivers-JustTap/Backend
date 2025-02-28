const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    captainId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain'
    },
    isRegistered: {
        type: Boolean,
        default: false
    },
    isGeneralCategory: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    dob: {
        type: Date
    },
    aadhar: {
        number: String,
        frontImage: {
            filename: String,
            path: String
        },
        backImage: {
            filename: String,
            path: String
        }
    },
    pan: {
        number: String,
        frontImage: {
            filename: String,
            path: String
        },
        backImage: {
            filename: String,
            path: String
        }
    },
    selfie: {
        filename: String,
        path: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    rideCount: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
