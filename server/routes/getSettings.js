const express = require("express");
const router = express.Router();

const getSettings = require("../controllers/getSettings");

router.get("/getSettings", getSettings);

module.exports = router;
