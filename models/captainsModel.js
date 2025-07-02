const mongoose = require('mongoose');

let captainsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ['car', 'moto', 'auto'],
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
        enum: ['Male', 'Female', 'Others'],
    },
    dob: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    profilePicture: {
        filename: { type: String },
        path: { type: String },
    },
    aadhar: {
        number: {
            type: String,
            unique: true,
            required: [true, 'Aadhar number is required'],
        },
        frontImage: {
            filename: { type: String },
            path: { type: String },
        },
        backImage: {
            filename: { type: String },
            path: { type: String },
        },
    },
    pancard: {
        number: {
            type: String,
            unique: true,
            required: [true, 'Pancard number is required'],
        },
        image: {
            filename: { type: String },
            path: { type: String },
        },
    },
    drivingLicense: {
        number: {
            type: String,
            unique: true,
            required: [true, 'Driving license number is required'],
        },
        frontImage: {
            filename: { type: String },
            path: { type: String },
        },
        backImage: {
            filename: { type: String },
            path: { type: String },
        },
        expiryDate: {
            type: Date,
        },
    },
    vehicleRc: {
        number: {
            type: String,
            required: [true, 'Vehicle RC number is required'],
        },
        frontImage: {
            filename: { type: String },
            path: { type: String },
        },
        backImage: {
            filename: { type: String },
            path: { type: String },
        },
    },
    isAadharValid: {
        type: Boolean,
        default: false,
    },
    isPanValid: {
        type: Boolean,
        default: false,
    },
    isDrivingLicenseValid: {
        type: Boolean,
        default: false,
    },
    isRcValid: {
        type: Boolean,
        default: false,
    },
    isValidCaptain: {
        type: Boolean,
        default: false,
    },

     location: {
        type: {
            type: String, // "Point"
            enum: ['Point'],
         
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
           
        }
    },


}, { timestamps: true });

captainsSchema.index({ location: '2dsphere' });


module.exports = mongoose.model('Captain', captainsSchema);