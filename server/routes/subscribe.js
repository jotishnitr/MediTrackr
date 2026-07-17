const express = require("express");
const subscribe = require("../controllers/subscribe");

const router = express.Router();

router.post("/subscribe", subscribe);

module.exports = router;
