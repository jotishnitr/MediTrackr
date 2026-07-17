const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const getHealthProfile = require("../controllers/getHealthProfile");

router.get("/getHealthProfile", auth, getHealthProfile);
module.exports = router;
