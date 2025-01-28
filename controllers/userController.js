const userService = require('../services/userService');

const registerUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, dateOfBirth, gender } = req.body;

        console.log("Request Body: ", req.body);

        // Validate required fields
        if (!name || !email || !phoneNumber || !dateOfBirth || !gender) {
            return res.status(400).json({ 
                message: 'All fields (name, email, phone number, date of birth, and gender) are required.' 
            });
        }

        // Validate gender
        const validGenders = ['Male', 'Female', 'Other'];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value.' });
        }

        // Check if the email already exists
        const isEmailExists = await userService.checkEmailExists(email);
        if (isEmailExists) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Check if the phone number already exists
        const isPhoneNumberExists = await userService.checkPhoneNumberExists(phoneNumber);
        if (isPhoneNumberExists) {
            return res.status(400).json({ message: 'Phone number is already registered.' });
        }

        // Create the user
        const newUser = await userService.createUser({ name, email, phoneNumber, dateOfBirth, gender });

        return res.status(201).json({ 
            message: 'User registered successfully.', 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                dateOfBirth: newUser.dateOfBirth,
                gender: newUser.gender
            }
        });
    } catch (error) {
        console.error("Error registering user:", error.message);

        // Handle specific errors like validation errors, database errors, etc.
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
const checkMobileNumber = async (req, res) => {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    try {
        // Check if the phone number exists and retrieve the user information
        const user = await userService.checkPhoneNumberExists(phoneNumber);

        if (user) {
            console.log("User ", user)
            return res.status(200).json({
                message: 'Phone number exists.',
                exists: true,
                userId: user._id, // Include the userId in the response
            });
        } else {
            return res.status(200).json({
                message: 'Phone number does not exist.',
                exists: false,
                userId: null, // Explicitly set userId to null when it doesn't exist
            });
        }
    } catch (error) {
        console.error('Error checking phone number:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = { registerUser, checkMobileNumber };

