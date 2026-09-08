const getCopilotHistory = require("../controllers/getCopilotHistory");
const deleteCopilotHistory = require("../controllers/deleteCopilotHistory");
const auth = require("../middleware/auth");

const express = require("express");
const router = express.Router();

router
  .route("/getCopilotHistory")
  .get(auth, getCopilotHistory)
  .delete(auth, deleteCopilotHistory);

module.exports = router;
