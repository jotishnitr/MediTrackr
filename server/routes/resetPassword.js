const express = require("express");
const resetPassword = require("../controllers/resetPassword");

const router = express.Router();

router.post("/reset-password/:token", resetPassword);

module.exports = router;
