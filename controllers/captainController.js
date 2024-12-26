const Captain = require('../models/captainsModel');

const createCaptain = async (req, res) => {
    try {
        const { name, vehicleType, mobileNumber, email, gender, dob, aadhar, pancard, drivingLicense, vehicleRc } = req.body;

        const files = req.files;

        const captain = new Captain({
            name,
            vehicleType,
            mobileNumber,
            email,
            gender,
            dob,
            aadhar,
            pancard,
            drivingLicense,
            vehicleRc,
            profilePicture: files.profilePicture ? {
                filename: files.profilePicture[0].filename,
                path: files.profilePicture[0].path,
            } : null,
            aadharFrontImage: files.aadharFrontImage ? {
                filename: files.aadharFrontImage[0].filename,
                path: files.aadharFrontImage[0].path,
            } : null,
            aadharBackImage: files.aadharBackImage ? {
                filename: files.aadharBackImage[0].filename,
                path: files.aadharBackImage[0].path,
            } : null,
            pancardImage: files.pancardImage ? {
                filename: files.pancardImage[0].filename,
                path: files.pancardImage[0].path,
            } : null,
            dlFrontImage: files.dlFrontImage ? {
                filename: files.dlFrontImage[0].filename,
                path: files.dlFrontImage[0].path,
            } : null,
            dlBackImage: files.dlBackImage ? {
                filename: files.dlBackImage[0].filename,
                path: files.dlBackImage[0].path,
            } : null,
            vehicleRcFrontImage: files.vehicleRcFrontImage ? {
                filename: files.vehicleRcFrontImage[0].filename,
                path: files.vehicleRcFrontImage[0].path,
            } : null,
            vehicleRcBackImage: files.vehicleRcBackImage ? {
                filename: files.vehicleRcBackImage[0].filename,
                path: files.vehicleRcBackImage[0].path,
            } : null,
        });

        await captain.save();
        res.status(201).json({ message: 'Captain created successfully', captain });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCaptain };
