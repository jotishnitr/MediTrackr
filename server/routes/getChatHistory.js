const getChatHistory = require("../controllers/getChatHistory");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/getChatHistory").get(auth, getChatHistory);
module.exports = router;
