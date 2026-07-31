const getChatHistory = require("../controllers/getChatHistory");
const deleteChatHistory = require("../controllers/deleteChatHistory");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/getChatHistory")
  .get(auth, getChatHistory)
  .delete(auth, deleteChatHistory);

module.exports = router;
