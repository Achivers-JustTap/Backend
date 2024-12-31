const Captain = require('../models/captainsModel');

const getInvalidCaptains = async (req, res) => {
    try {
        const invalidCaptains = await Captain.find({ isValidCaptain: false });

        if (!invalidCaptains.length) {
            return res.status(404).json({
                success: false,
                message: 'No captains found with isValidCaptain set to false',
            });
        }

        res.status(200).json({
            success: true,
            message: 'List of captains with isValidCaptain set to false',
            data: invalidCaptains,
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching captains',
            error: error.message,
        });
    }
};

module.exports = { getInvalidCaptains };
