const mongoose = require("mongoose");
const express = require("express");
const requireAuth = require("../middlewares/reqAuth");

const Track = mongoose.model("Track");

const router = express.Router();

router.use(requireAuth);

router.post("/track", async (req, res) => {
  try {
    const tracks = await Track.find({ userId: req.user._id });
    res.send(tracks);
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: err.message });
  }
});

router.post("/tracks", async (req, res) => {
  const { name, locations } = req.body;
  if (!name || !locations) {
    return res
      .status(422)
      .send({ error: "You must provide a name and locations " });
  }

  try {
    const track = new Track({ name, locations, userId: req.user._id });
    await track.save();
    res.send(track);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.delete("/track", async (req, res) => {
  try {
    console.log(req.body);
    await Track.findByIdAndDelete(req.body.id);
    res.status(204).send({});
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
