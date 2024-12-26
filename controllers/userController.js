const userService = require('../services/userService');

const registerUser  = async (req, res) => {
    try {
        const userData = req.body;
        console.log(" Body of Reqyest ",userData);

        // Validate user data (you can use a library like Joi for more complex validation)
        if (!userData.name || !userData.email || !userData.phoneNumber) {
            return res.status(400).json({ message: 'Name, email, and phone number are required.' });
        }

        const newUser  = await userService.createUser (userData);
        return res.status(201).json({ message: 'User  registered successfully', user: newUser  });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser  };