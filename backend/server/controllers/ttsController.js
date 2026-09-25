const {
    textToSpeech
} = require("../services/voiceService");


// ============================================================
// TTS CONTROLLER
// ============================================================

async function ttsController(req, res) {

    try {

        // ====================================================
        // REQUEST BODY
        // ====================================================

        const {
            text,
            language,
            sessionId
        } = req.body || {};


        console.log(
            "\n===== TTS CONTROLLER ====="
        );

        console.log(
            "Request method:",
            req.method
        );

        console.log(
            "Request content-type:",
            req.headers["content-type"]
        );

        console.log(
            "Request body:",
            req.body
        );


        // ====================================================
        // VALIDATE TEXT
        // ====================================================

        if (
            !text ||
            !String(text).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Text is required."

            });

        }


        // ====================================================
        // LANGUAGE
        // ====================================================

        const selectedLanguage =
            language ||
            "en-IN";


        console.log(
            "TTS text:",
            text
        );

        console.log(
            "TTS language:",
            selectedLanguage
        );

        console.log(
            "Session ID:",
            sessionId || "N/A"
        );


        // ====================================================
        // GENERATE AUDIO
        // ====================================================

        const audioBuffer =
            await textToSpeech(

                text,

                selectedLanguage

            );


        // ====================================================
        // BUFFER → BASE64
        // ====================================================

        const audio =
            audioBuffer.toString(
                "base64"
            );


        console.log(
            "\n===== TTS SUCCESS ====="
        );

        console.log(
            "Audio size:",
            audio.length
        );

        console.log(
            "Language used:",
            selectedLanguage
        );

        console.log(
            "=======================\n"
        );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            audio:
                `data:audio/wav;base64,${audio}`,

            audioMimeType:
                "audio/wav",

            language:
                selectedLanguage,

            text:
                text,

            sessionId:
                sessionId || null

        });

    }

    catch (error) {

        console.error(
            "\n===== TTS CONTROLLER ERROR ====="
        );

        console.error(
            error
        );

        console.error(
            "================================\n"
        );


        return res.status(500).json({

            success: false,

            message:
                "Text to speech failed.",

            error:
                error.message

        });

    }

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    ttsController

};