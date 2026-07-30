const feedback = require("../controllers/feedback");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/feedback").post(auth, feedback);

module.exports = router;
