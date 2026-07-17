const express = require("express");
const router = express.Router();
const reminderMedicine = require("../controllers/reminderMedicine");
router.route("/reminderMedicine").put(reminderMedicine);

module.exports = router;
