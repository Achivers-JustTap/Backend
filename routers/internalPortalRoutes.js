const express = require('express');
const { getInvalidCaptains  } = require('../controllers/internalPortalControllers');
const router = express.Router();

router.get('/getAllUsersToBeApproved', getInvalidCaptains );

module.exports = router;