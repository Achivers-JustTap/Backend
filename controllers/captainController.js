const Captain = require('../models/captainsModel'); 
const moment = require('moment');

// Function to search mobile number
const searchMobileNumber = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    const captain = await Captain.findOne({ mobileNumber });

    if (captain) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error searching mobile number:', error);
    return res.status(500).json({ message: 'Error searching mobile number', error });
  }
};

// Function to store captain info
const storeCaptainInfo = async (req, res) => {
    console.log("Request Data", req.body);
    try {
        const {
            name,
            gender,
            email,
            dateOfBirth,
            mobileNumber,
            accountNumber,
            bankName,
            ifscCode,
            upi,
            aadharNumber,
            panNumber,
            drivingLicenseNumber,
            drivingLicenseValidDate,
            rcNumber,
            vehicleType
        } = req.body;

        // Validate and parse the drivingLicenseValidDate
        const parsedExpiryDate = moment(drivingLicenseValidDate, 'DD/MM/YYYY', true);
        if (!parsedExpiryDate.isValid()) {
            return res.status(400).json({
                message: "Invalid driving license expiry date. Please use the format DD/MM/YYYY.",
            });
        }

        // Validate and parse the dateOfBirth
        const parsedDob = moment(dateOfBirth, 'DD/MM/YYYY', true);
        if (!parsedDob.isValid()) {
            return res.status(400).json({
                message: "Invalid date of birth. Please use the format DD/MM/YYYY.",
            });
        }

        // Map the files into the schema format
        const files = req.files || {};

        const newCaptain = new Captain({
            name,
            gender,
            email,
            dob: parsedDob.toDate(), // Use the parsed date for DOB
            mobileNumber,
            profilePicture: {
                filename: files.profilePicture?.[0]?.filename,
                path: files.profilePicture?.[0]?.path,
            },
            aadhar: {
                number: aadharNumber,
                frontImage: {
                    filename: files.aadharFront?.[0]?.filename,
                    path: files.aadharFront?.[0]?.path,
                },
                backImage: {
                    filename: files.aadharBack?.[0]?.filename,
                    path: files.aadharBack?.[0]?.path,
                },
            },
            pancard: {
                number: panNumber,
                image: {
                    filename: files.panFront?.[0]?.filename,
                    path: files.panFront?.[0]?.path,
                },
            },
            drivingLicense: {
                number: drivingLicenseNumber,
                frontImage: {
                    filename: files.drivingLicenseFront?.[0]?.filename,
                    path: files.drivingLicenseFront?.[0]?.path,
                },
                backImage: {
                    filename: files.drivingLicenseBack?.[0]?.filename,
                    path: files.drivingLicenseBack?.[0]?.path,
                },
                expiryDate: parsedExpiryDate.toDate(), // Use the parsed date for expiry
            },
            vehicleRc: {
                number: rcNumber,
                frontImage: {
                    filename: files.rcFront?.[0]?.filename,
                    path: files.rcFront?.[0]?.path,
                },
                backImage: {
                    filename: files.rcBack?.[0]?.filename,
                    path: files.rcBack?.[0]?.path,
                },
            },
            vehicleType,
        });

        // Save to the database
        const savedCaptain = await newCaptain.save();
        res.status(201).json({
            message: 'Captain created successfully',
            captain: savedCaptain,
        });
    } catch (error) {
        console.error('Error creating captain:', error);
        res.status(500).json({ message: 'Error creating captain', error });
    }
};

module.exports = {
  searchMobileNumber,
  storeCaptainInfo,
};
