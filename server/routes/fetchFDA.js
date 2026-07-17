const express = require("express");
const router = express.Router();
const fetchFDA = require("../controllers/fetchFDA");
router.route("/searchMed/api").get(fetchFDA);

module.exports = router;
