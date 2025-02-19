const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDB = require('./db/db');
const userRoutes = require('./routers/userRoutes');
const captainRoutes = require('./routers/captainRoutes');
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
app.use('/api/internalpotal', internalPortalRoutes);
app.use('/api/maps', mapsRouter);
app.use('/rides', rideRoutes);
app.get('/health',(req,res)=>{
    res.send("Healthy")
})

// Create HTTP Server and Initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST'],
    },
});

// WebSocket Logic
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Register socket to user or captain
  socket.on('register-socket', async ({ userId, userType }) => {
      try {
          if (userType === 'user') {
            console.log("register-socket",userId)
              await User.findByIdAndUpdate(userId, { socketId: socket.id });
          } else if (userType === 'captain') {
              await Captain.findByIdAndUpdate(userId, { socketId: socket.id });
          }
          console.log(`Socket registered for ${userType} with ID: ${userId}`);
      } catch (err) {
          console.error(`Error registering socket: ${err.message}`);
      }
  });

  // Disconnect socket
//   socket.on('disconnect', async () => {
//       try {
//           await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
//           await Captain.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
//           console.log(`Socket disconnected: ${socket.id}`);
//       } catch (err) {
//           console.error(`Error during socket disconnect: ${err.message}`);
//       }
//   });
});

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

module.exports = { app, io };
