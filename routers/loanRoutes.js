const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const upload = require('../middlewares/upload');
const { validateMobileNumber } = require('../middlewares/validation');

router.post('/check', loanController.checkMobileNumber);

// Check captain ID existence
router.get('/checkCaptainId/:captainId', loanController.checkCaptainId);

// Register new user or captain
router.post('/register', 
    upload.fields([
        { name: 'aadharFront', maxCount: 1 },
        { name: 'aadharBack', maxCount: 1 },
        { name: 'panFront', maxCount: 1 },
        { name: 'panBack', maxCount: 1 },
        { name: 'selfie', maxCount: 1 }
    ]),
    loanController.registerUserOrCaptain
);

// Get details by mobile number
router.get('/details/:mobileNumber', validateMobileNumber, loanController.getDetailsByMobileNumber);



module.exports = router;
