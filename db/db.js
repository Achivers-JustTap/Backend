const mongoose = require('mongoose');

//Connect to DB
const connectToDB=()=>{
    mongoose.connect('mongodb+srv://chandus1603:zXUHNPJRj9Ur3Fgt@achiversdb.gc6cr.mongodb.net/?retryWrites=true&w=majority&appName=AchiversDB', { useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.error("Could not connect to MongoDB...", err));
}

// export the connection
module.exports = connectToDB;



