const express = require("express");
const router = express.Router();
const setBrowserAlerts = require("../controllers/setBrowerAlerts");
router.route("/setBrowserAlerts").put(setBrowserAlerts);

module.exports = router;
