const userModel = require('../models/userModel');

// Check if email already exists
const checkEmailExists = async (email) => {
    return await userModel.findOne({ email }) ? true : false;
};

// Check if phone number already exists
const checkPhoneNumberExists = async (phoneNumber) => {
    return await userModel.findOne({ phoneNumber }); // Returns the user object if found, or null otherwise
};

// Create a new user
const createUser = async (userData) => {
    const user = new userModel(userData);
    return await user.save();
};

module.exports = { checkEmailExists, checkPhoneNumberExists, createUser };

