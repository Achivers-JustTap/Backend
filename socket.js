const socketIo = require('socket.io');
const userModel = require('./models/userModel');
const captainModel = require('./models/captainsModel');

let io;

function initializeSocket(server){
    io = socketIo(server,{
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`a user connected, ${socket.id}`);

        socket.on('join', async (data) => {
            const { userId, userType } = data;
             console.log(`User ${userId} joined as ${userType}`);
    
                // Update the user's socket ID in the database
                if (userType === 'user') {
                   await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else if (userType === 'captain') {
                    await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                }
    
            });

            socket.on('update-location-captain', async (data) => {
                const { userId, location } = data;

                if (
                    !location ||
                    typeof location.lat !== 'number' ||
                    typeof location.lng !== 'number'
                ) {
                    console.error('Invalid location data:', location);
                    return socket.emit('error', 'Invalid location data. Must be numbers.');
                }

                try {
                    await captainModel.findByIdAndUpdate(userId, {
                        location: {
                            type: "Point",
                            coordinates: [location.lng, location.lat], // ORDER: [lng, lat]
                        },
                    });
                    console.log(`Updated location for captain ${userId}`);
                } catch (err) {
                    console.error('Error updating location:', err);
                    socket.emit('error', 'Failed to update location');
                }
            });

            socket.on('ride-accepted', async (data) => {
    const { captainId, rideId } = data;

    try {
      // Update the ride status to 'accepted'
      const ride = await Ride.findByIdAndUpdate(rideId, { status: 'accepted' });

      if (ride) {
        
        sendMessageToSocketId(ride.customerSocketId, {
          event: 'ride-accepted',
          data: { message: 'Your ride has been accepted by the captain!' }
        });

        
        sendMessageToSocketId(captainId, {
          event: 'ride-accepted',
          data: { message: 'ride accepted by other captains.' }
        });
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  });

  socket.on('ride-confirmed', async (data) => {
    const { rideId, userSocketId } = data;

    try {
      console.log(`Ride confirmed: ${rideId}`);

      if (userSocketId) {
        sendMessageToSocketId(userSocketId, {
          event: 'ride-confirmed',
          data: { message: 'Your ride has been confirmed!' }
        });
      }
    } catch (err) {
      console.error('Error handling ride-confirmed event:', err);
    }
  });

  socket.on('ride-confirmed', async (data) => {
    const { rideId, userSocketId } = data;

    try {
      console.log(`Ride confirmed: ${rideId}`);

      if (userSocketId) {
        sendMessageToSocketId(userSocketId, {
          event: 'ride-confirmed',
          data: { message: 'Your ride has been confirmed!' }
        });
      }
    } catch (err) {
      console.error('Error handling ride-confirmed event:', err);
    }
  });

        socket.on('disconnect', () => {
            console.log(`a user disconnected, ${socket.id}`);
        });
    });
   
}

function sendMessageToSocketId(socketId, messageObject) {
    console.log(`Sending message to ${socketId}:`, messageObject);
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log("Socket not initialized");
    }
}

module.exports = {initializeSocket, sendMessageToSocketId}
