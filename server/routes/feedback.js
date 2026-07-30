const feedback = require('../controllers/feedback');
const express = require('express')
const router = express.Router();

router.route('/feedback').post(feedback);

module.exports = router;