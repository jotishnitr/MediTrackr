const healthLogAI = require("../controllers/healthLogAI");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
router.post("/health-log-ai", auth, healthLogAI);
module.exports = router;