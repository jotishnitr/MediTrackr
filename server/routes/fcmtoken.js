const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { saveFcmToken } = require("../controllers/saveFcmToken");
router.post("/save-fcm-token", auth, saveFcmToken);
module.exports = router;
