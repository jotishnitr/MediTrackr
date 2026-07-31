const geminiAiAssistant = require("../controllers/geminiAiAssistant");
const auth = require('../middleware/auth')

const express=require('express');
const router=express.Router();

router.route(/api/assistant).post(geminiAiAssistant);

module.exports=router;