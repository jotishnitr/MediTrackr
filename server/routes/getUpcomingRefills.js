const express = require("express");
const router = express.Router();
const getUpcomingRefills = require("../controllers/getUpcomingRefills");
const auth = require("../middleware/auth");

router.route("/getUpcomingRefills").get(auth, getUpcomingRefills);

module.exports = router;
