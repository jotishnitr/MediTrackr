const express = require("express");
const router = express.Router();
const statusMedicine = require("../controllers/statusMedicine");
router.route("/statusMedicine").put(statusMedicine);

module.exports = router;
