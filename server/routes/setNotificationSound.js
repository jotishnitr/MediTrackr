const express = require("express");
const router = express.Router();

const setNotificationSound = require("../controllers/setNotificationSound");

router.put("/setNotificationSound", setNotificationSound);

module.exports = router;
