const express = require("express");
const Rating = require("../models/ratingModel");

const router = express.Router();

// Submit rating (for both driver & customer)
router.post("/rate", async (req, res) => {
  try {
    const { rideId, givenBy, ratedFor, ratingType, rating, review } = req.body;

    if (!rideId || !givenBy || !ratedFor || !rating || !ratingType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["driver", "customer"].includes(ratingType)) {
      return res.status(400).json({ message: "Invalid ratingType. Use 'driver' or 'customer'." });
    }

    const newRating = new Rating({ rideId, givenBy, ratedFor, ratingType, rating, review });
    await newRating.save();

    res.status(201).json({ message: "Rating submitted successfully", data: newRating });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get average rating for a driver
router.get("/driver-rating/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const ratings = await Rating.find({ ratedFor: driverId, ratingType: "driver" });

    if (ratings.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    res.json({ averageRating, totalReviews: ratings.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get average rating for a customer
router.get("/customer-rating/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const ratings = await Rating.find({ ratedFor: customerId, ratingType: "customer" });

    if (ratings.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    res.json({ averageRating, totalReviews: ratings.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
