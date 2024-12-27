const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const captainController = require('../controllers/captainController'); // Update path if necessary

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

// Routes
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
  captainController.storeCaptainInfo
);

router.post('/searchMobileNumber', captainController.searchMobileNumber);

router.get('/health', (req, res) => {
  res.status(200).json({ message: 'Captain API is running successfully!' });
});
// Exporting the router
module.exports = router;
