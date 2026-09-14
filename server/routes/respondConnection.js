const express = require("express");
const router = express.Router();
const respondConnection = require("../controllers/respondConnection");
const auth = require("../middleware/auth");

router.route("/respondConnection").post(auth, respondConnection);

module.exports = router;
