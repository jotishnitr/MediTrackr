const express = require("express");
const router = express.Router();
const getHealthLog = require("../controllers/getHealthLog");
const auth = require("../middleware/auth");
router.route("/healthLog/api").get(auth, getHealthLog);

module.exports = router;
