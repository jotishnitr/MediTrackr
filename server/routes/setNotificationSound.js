const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const setNotificationSound = require("../controllers/setNotificationSound");

router.put("/setNotificationSound", auth, setNotificationSound);

module.exports = router;
