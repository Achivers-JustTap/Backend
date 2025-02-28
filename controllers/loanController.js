const Loan = require('../models/loanModel');
const User = require('../models/userModel');
const Captain = require('../models/captainsModel');

const checkMobileNumber = async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        
        // Check if number exists in user collection
        const user = await User.findOne({ phoneNumber: mobileNumber });
        
        // Check if number exists in captain collection
        const captain = await Captain.findOne({ mobileNumber });
        
        if (user || captain) {
            return res.status(200).json({
                exists: true,
                user: user ? true : false,
                captain: captain ? true : false
            });
        }
        
        return res.status(200).json({
            exists: false
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registerUserOrCaptain = async (req, res) => {
    try {
        const { mobileNumber, userType, ...details } = req.body;
        
        let newRecord;
        if (userType === 'user') {
            // For registered users, fetch their documents from user model
            const user = await User.findOne({ phoneNumber: mobileNumber });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            newRecord = await Loan.create({
                mobileNumber,
                userId: user._id,
                isRegistered: true,
                aadhar: {
                    number: user.aadhar?.number,
                    frontImage: user.aadhar?.frontImage,
                    backImage: user.aadhar?.backImage
                },
                pan: {
                    number: user.pan?.number,
                    frontImage: user.pan?.frontImage,
                    backImage: user.pan?.backImage
                },
                selfie: user.profilePicture
            });
        } else if (userType === 'general') {
            // For general category, create new record with all details
            newRecord = await Loan.create({
                mobileNumber,
                isGeneralCategory: true,
                name: details.name,
                email: details.email,
                gender: details.gender,
                dob: details.dob,
                aadhar: {
                    number: details.aadharNumber,
                    frontImage: details.aadharFront,
                    backImage: details.aadharBack
                },
                pan: {
                    number: details.panNumber,
                    frontImage: details.panFront,
                    backImage: details.panBack
                },
                dateOfBirth: details.dateOfBirth, 
                gender: details.gender, 
                selfie: details.selfie
            });
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        res.status(201).json({
            message: 'Registration successful',
            data: newRecord
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDetailsByMobileNumber = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
       
        const user = await User.findOne({ phoneNumber: mobileNumber }).lean();
        console.log("User Details:", user); 

        const captain = await Captain.findOne({ mobileNumber });
        
        if (user && captain) {
            return res.status(200).json({
                existsInBoth: true,
                userDetails: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    profileImage: user.profileImage,
                    __v: user.__v
                },
                captainDetails: {
                    ...captain._doc
                }
            });
        }

        if (user) {
            return res.status(200).json({
                existsInBoth: false,
                userDetails: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    profileImage: user.profileImage,
                    __v: user.__v
                }
            });
        }

        if (captain) {
            return res.status(200).json({
                existsInBoth: false,
                captainDetails: {
                    ...captain._doc
                }
            });
        }

        return res.status(404).json({ message: 'Mobile number not found' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const checkCaptainId = async (req, res) => {
    try {
        const { captainId } = req.params; // Change to use params

        console.log("Checking captain ID:", captainId); // Debugging log

        // Check if captain ID exists in the captain collection
        const captain = await Captain.findById(captainId);

        if (captain) {
            return res.status(200).json({
                exists: true,
                captainDetails: {
                    ...captain._doc
                }
            });
        }

        return res.status(200).json({
            exists: false
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    checkMobileNumber,
    registerUserOrCaptain,
    getDetailsByMobileNumber,
    checkCaptainId
};
