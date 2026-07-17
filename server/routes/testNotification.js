const express = require("express");
const router = express.Router();

const testNotification = require("../controllers/testNotification");

router.post("/testNotification", testNotification);

module.exports = router;
