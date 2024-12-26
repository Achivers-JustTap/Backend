const mongoose = require('mongoose');

//Connect to DB
const connectToDB=()=>{
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.error("Could not connect to MongoDB...", err));
}

// export the connection
module.exports = connectToDB;



