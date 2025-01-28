const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Must consist of at least three characters.']
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true,
        minlength: [10, 'Phone number should have a minimum length of 10 digits.']
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                return age >= 18;
            },
            message: 'User must be at least 18 years old.'
        }
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'],
        message: 'Gender must be either Male, Female, or Other.'
    },
    socketId: {
        type: String
    }
});

module.exports = mongoose.model("User", userSchema);
