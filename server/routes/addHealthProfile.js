const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const addHealthProfile = require("../controllers/addHealthProfile");

router.post("/addHealthProfile", auth, addHealthProfile);
module.exports = router;