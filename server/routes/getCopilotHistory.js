const getCopilotHistory = require("../controllers/getCopilotHistory");
const deleteCopilotHistory = require("../controllers/deleteCopilotHistory");
const updateCopilotHistory = require("../controllers/updateCopilotHistory");
const auth = require("../middleware/auth");

const express = require("express");
const router = express.Router();

router
  .route("/getCopilotHistory")
  .get(auth, getCopilotHistory)
  .patch(auth, updateCopilotHistory)
  .put(auth, updateCopilotHistory)
  .delete(auth, deleteCopilotHistory);

router
  .route("/updateCopilotStatus")
  .patch(auth, updateCopilotHistory)
  .post(auth, updateCopilotHistory);

module.exports = router;
