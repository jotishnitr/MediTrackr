const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const updateMedicine = require("../controllers/updateMedicine");

router.route("/updateMedicine").put(auth, updateMedicine);

module.exports = router;
