const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require("cors");
const connectToDB = require('./db/db');
const userRoutes = require('./routers/userRoutes');
const captainRoutes = require('./routers/captainRoutes');
const internalPortalRoutes = require('./routers/internalPortalRoutes');
const mapsRouter = require('./routers/mapsRoutes');
const path = require('path');


// Initialize DB Connection
connectToDB();

const app = express();

// Middleware
app.use(cors()); // Restrict in production to specific domains
app.use(express.json({ limit: '10mb' })); // Increase limit if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/internalpotal',internalPortalRoutes);
app.use('/api/maps', mapsRouter);

// Start the server
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An internal server error occurred' });
});

module.exports = app;
