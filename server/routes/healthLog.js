const express = require("express");
const router = express.Router();
const healthLog = require("../controllers/healthLog");
const auth = require("../middleware/auth");
router.route("/healthLog").post(auth, healthLog);

module.exports = router;
