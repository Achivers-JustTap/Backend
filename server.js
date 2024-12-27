const http = require('http');
const app = require('./app');
const userRoutes = require('./routers/userRoutes');
const captainRoutes = require('./routers/captainRoutes');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);


server.listen(5000, '0.0.0.0',()=>{
  console.log('Server is running on port 5000');
});



