const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  timestamp: Number, // if we want to define only one property
  coords: {
    // of type we can define it directly
    latitude: Number,
    longitude: Number,
    altitude: Number,
    accuracy: Number,
    heading: Number,
    speed: Number,
  },
});

const trackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    default: "",
  },
  locations: [pointSchema],
});

mongoose.model("Track", trackSchema);
