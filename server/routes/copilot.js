const copilot = require("../controllers/copilot");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/api/copilot").post(auth, copilot);

module.exports = router;
