const express = require("express");

const {
    ttsController
} = require("../controllers/ttsController");

const router = express.Router();

// Make sure this route can parse JSON requests
router.use(
    express.json({
        limit: "10mb"
    })
);

// POST /api/tts
router.post(
    "/",
    ttsController
);

module.exports = router;