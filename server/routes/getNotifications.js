const express = require("express");
const router = express.Router();
const getNotifications = require("../controllers/getNotifications");
const markAllAsRead = require("../controllers/markAllAsRead");
const auth = require("../middleware/auth");

router.route("/getNotifications").get(auth, getNotifications);
router.route("/markAllAsRead").post(auth, markAllAsRead);

module.exports = router;