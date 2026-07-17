const express = require('express');
const { googleLogin } = require('../controllers/googleLogin');
const router = express.Router();

router.route('/googleLogin').post(googleLogin);
module.exports = router;