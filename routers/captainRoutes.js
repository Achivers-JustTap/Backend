const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Route for handling uploads and form data
router.post(
  '/upload',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'drivingLicenseFront', maxCount: 1 },
    { name: 'drivingLicenseBack', maxCount: 1 },
    { name: 'panFront', maxCount: 1 },
    { name: 'panBack', maxCount: 1 },
    { name: 'rcFront', maxCount: 1 },
    { name: 'rcBack', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const files = req.files;
      const body = req.body;

      // Response structure combining uploaded files and form data
      const response = {
        name: body.name,
        gender: body.gender,
        email: body.email,
        dateOfBirth: body.dateOfBirth,
        mobileNumber: body.mobileNumber,
        bankAccountDetails: {
          accountNumber: body.accountNumber,
          bankName: body.bankName,
          ifscCode: body.ifscCode,
          upi: body.upi,
        },
        profilePicture: files.profilePicture?.[0]?.path,
        aadhar: {
          frontImage: files.aadharFront?.[0]?.path,
          backImage: files.aadharBack?.[0]?.path,
          number: body.aadharNumber,
        },
        pan: {
          frontImage: files.panFront?.[0]?.path,
          backImage: files.panBack?.[0]?.path,
          number: body.panNumber,
        },
        drivingLicense: {
          frontImage: files.drivingLicenseFront?.[0]?.path,
          backImage: files.drivingLicenseBack?.[0]?.path,
          number: body.drivingLicenseNumber,
          validDate: body.drivingLicenseValidDate,
        },
        rc: {
          frontImage: files.rcFront?.[0]?.path,
          backImage: files.rcBack?.[0]?.path,
          number: body.rcNumber,
        },
        vehicleType: body.vehicleType,
      };

      res.status(200).json({
        message: 'Files and details uploaded successfully',
        data: response,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading files or details', error });
    }
  }
);
// Route for searching a mobile number
router.post('/searchMobileNumber', async (req, res) => {
    const { mobileNumber } = req.body;
  
    try {
      // Check if the mobile number exists in the database
      const captain = await Captain.findOne({ phoneNumber: mobileNumber });
  
      if (captain) {
        // Mobile number exists
        return res.status(200).json({ exists: true });
      } else {
        // Mobile number does not exist
        return res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error('Error searching mobile number:', error);
      return res.status(500).json({ message: 'Error searching mobile number', error });
    }
  });

module.exports = router;
