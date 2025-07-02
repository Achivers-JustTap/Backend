const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectToDB = require('./db/db');
const userRoutes = require('./routers/userRoutes');
const captainRoutes = require('./routers/captainRoutes');
const loanRoutes = require('./routers/loanRoutes');


const internalPortalRoutes = require('./routers/internalPortalRoutes');
const mapsRouter = require('./routers/mapsRoutes');
const rideRoutes = require('./routers/rideRoutes');
const path = require('path');
const User = require('./models/userModel');
const Captain = require('./models/captainsModel');

// Initialize DB Connection
connectToDB();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/loan', loanRoutes);

app.use('/api/internalpotal', internalPortalRoutes);
app.use('/api/maps', mapsRouter);
app.use('/rides', rideRoutes);
app.get('/health',(req,res)=>{
    res.send("Healthy")
})


const server = http.createServer(app);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An internal server error occurred' });
});

// Start the Server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app };
