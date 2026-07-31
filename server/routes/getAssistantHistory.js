const getAssistantHistory = require("../controllers/getAssistantHistory");
const auth = require("../middleware/auth");

const express = require("express");

const router = express.Router();

router.route("/getAssistantHistory").get(auth, getAssistantHistory);

module.exports = router;
