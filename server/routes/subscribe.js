const express = require("express");
const auth = require("../middleware/auth");
const subscribe = require("../controllers/subscribe");

const router = express.Router();

router.post("/subscribe", auth, subscribe);

module.exports = router;
