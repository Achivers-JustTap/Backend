const { body, param } = require('express-validator');

const validateMobileNumber = [
    param('mobileNumber')
        .exists().withMessage('Mobile number is required')
        .isLength({ min: 10, max: 10 }).withMessage('Mobile number must be 10 digits')
        .isNumeric().withMessage('Mobile number must contain only numbers')
];

module.exports = {
    validateMobileNumber
};
