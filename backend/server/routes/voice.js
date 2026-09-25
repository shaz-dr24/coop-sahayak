const express = require("express");

const {
    voiceController
} = require("../controllers/voiceController");


const router =
    express.Router();


// ============================================
// VOICE
// ============================================

router.post(
    "/",
    voiceController
);


module.exports = router;