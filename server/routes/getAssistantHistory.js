const getAssistantHistory = require("../controllers/getAssistantHistory");
const deleteAssistantHistory = require("../controllers/deleteAssistantHistory");
const auth = require("../middleware/auth");

const express = require("express");

const router = express.Router();

router.route("/getAssistantHistory")
  .get(auth, getAssistantHistory)
  .delete(auth, deleteAssistantHistory);

module.exports = router;
