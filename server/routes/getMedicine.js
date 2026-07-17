const express = require("express");
const router = express.Router();
const getMedicine = require("../controllers/getMedicine");
const auth = require('../middleware/auth')
router.route("/getMedicine").get(auth, getMedicine);

module.exports = router;
