const Captain = require('../models/captainsModel');

const createCaptain = async (captainData) => {
    // You can add additional logic for image uploads or other processing here

    const captain = new Captain(captainData);
    return await captain.save();
};

module.exports = { createCaptain };