const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Ride" },
  givenBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, 
  ratedFor: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, 
  ratingType: { type: String, enum: ["driver", "customer"], required: true }, 
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rating", ratingSchema);
