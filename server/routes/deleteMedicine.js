const express = require("express");
const router = express.Router();
const deleteMedicine = require("../controllers/deleteMedicine");
const auth = require('../middleware/auth')
router.route("/deleteMedicine").delete(auth, deleteMedicine);

module.exports = router;
