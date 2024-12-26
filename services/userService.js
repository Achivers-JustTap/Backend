const User = require('../models/userModel');

const createUser  = async (userData) => {
    // Hash password if you have a password field
    // userData.password = await bcrypt.hash(userData.password, 10);

    const user = new User(userData);
    return await user.save();
};

module.exports = { createUser  };