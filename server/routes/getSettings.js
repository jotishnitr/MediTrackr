const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const getSettings = require("../controllers/getSettings");

router.get("/getSettings", auth, getSettings);

module.exports = router;
