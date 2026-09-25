// ============================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ============================================

require("dotenv").config();


// ============================================
// IMPORTS
// ============================================

const express = require("express");
const cors = require("cors");

const voiceRoutes =
    require("./routes/voice");

const chatRoutes =
    require("./routes/chat");

const schemeRoutes =
    require("./routes/schemes");

const ttsRoutes =
    require("./routes/tts");


// ============================================
// APP
// ============================================

const app = express();

const PORT =
    process.env.PORT || 5050;


// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());


// ============================================
// JSON BODY PARSER
// ============================================

// IMPORTANT:
// This MUST come before /api/tts,
// /api/voice, /api/chat, etc.
//
// Otherwise req.body will be undefined.

app.use(
    express.json({
        limit: "100mb"
    })
);


// ============================================
// VOICE ROUTES
// ============================================

app.use(
    "/api/voice",
    voiceRoutes
);


// ============================================
// TTS ROUTES
// ============================================

app.use(
    "/api/tts",
    ttsRoutes
);


// ============================================
// CHAT ROUTES
// ============================================

app.use(
    "/api/chat",
    chatRoutes
);


// ============================================
// SCHEME ROUTES
// ============================================

app.use(
    "/api/schemes",
    schemeRoutes
);


// ============================================
// HEALTH CHECK
// ============================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Coop Sahayak backend is running"

        });

    }
);


// ============================================
// START SERVER
// ============================================

app.listen(
    PORT,
    () => {

        console.log(
            `Coop Sahayak backend running on port ${PORT}`
        );

    }
);