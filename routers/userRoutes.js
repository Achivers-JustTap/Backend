const express = require('express');
const { registerUser, checkMobileNumber } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);

// Route to check if a mobile number already exists
router.get('/check-mobile', checkMobileNumber);

module.exports = router;
