const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Must consists of Three Characters atleast']
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique:true,
        minlength:[10,"Phone number should have minimum length of 10 digits"]
    },
    socketId: {
        type: String
    },
    profileImage:{
            filename: String,
            path: String,
            createdAt: { type: Date, default: Date.now },
    }


})

module.exports = mongoose.model("User", userSchema);