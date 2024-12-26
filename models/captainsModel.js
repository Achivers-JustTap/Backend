const mongoose = require('mongoose');

let captainsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ['car', 'bike', 'auto'],
    },
    mobileNumber: {
        type: Number,
        unique: true,
        required: [true, 'Mobile number is required'],
        minlength: [10, 'Must be 10 digits'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others'],
    },
    dob: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    profilePicture: {
        filename: String,
        path: String,
    },
    aadhar: {
        type: String,
        unique: true,
        required: [true, 'Aadhar number is required'],
    },
    aadharFrontImage: {
        filename: String,
        path: String,
    },
    aadharBackImage: {
        filename: String,
        path: String,
    },
    pancard: {
        type: String,
        unique: true,
        required: [true, 'Pancard number is required'],
    },
    pancardImage: {
        filename: String,
        path: String,
    },
    drivingLicense: {
        type: String,
        unique: true,
        required: [true, 'Driving license number is required'],
    },
    dlFrontImage: {
        filename: String,
        path: String,
    },
    dlBackImage: {
        filename: String,
        path: String,
    },
    dlExpiryDate: {
        type: Date,
        required: [true, 'Driving license expiry date is required'],
    },
    vehicleRc: {
        type: String,
        required: [true, 'Vehicle RC number is required'],
    },
    vehicleRcFrontImage: {
        filename: String,
        path: String,
    },
    vehicleRcBackImage: {
        filename: String,
        path: String,
    },
    socketId: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Captain', captainsSchema);
