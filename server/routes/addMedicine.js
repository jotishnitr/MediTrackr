const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const addMedicine = require("../controllers/addMedicine");
router.route("/addMedicine").post(auth, addMedicine);

module.exports = router;
