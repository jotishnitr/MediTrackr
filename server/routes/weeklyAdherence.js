const express = require("express");
const router = express.Router();
const weeklyAdherence = require("../controllers/weeklyAdherence");
const auth = require("../middleware/auth");
router.route("/weeklyAdherence").get(auth, weeklyAdherence);

module.exports = router;
