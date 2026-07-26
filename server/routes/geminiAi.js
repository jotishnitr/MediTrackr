const geminiAi = require("../controllers/geminiAi");

const express = require("express");
const router = express.Router();

router.route("/api/chat").post(geminiAi);

module.exports = router;
