const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const setBrowserAlerts = require("../controllers/setBrowerAlerts");
router.route("/setBrowserAlerts").put(auth, setBrowserAlerts);

module.exports = router;
