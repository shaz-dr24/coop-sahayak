const {
    transcribeAudio,
    textToSpeech
} = require("../services/voiceService");


// ============================================
// DETECT LANGUAGE FROM TEXT
// ============================================

function detectLanguage(text) {

    const value =
        String(text || "").trim();


    // ========================================
    // TAMIL
    // ========================================

    if (
        /[\u0B80-\u0BFF]/.test(value)
    ) {

        return "ta-IN";
    }


    // ========================================
    // TELUGU
    // ========================================

    if (
        /[\u0C00-\u0C7F]/.test(value)
    ) {

        return "te-IN";
    }


    // ========================================
    // HINDI
    // ========================================

    if (
        /[\u0900-\u097F]/.test(value)
    ) {

        return "hi-IN";
    }


    // ========================================
    // ENGLISH
    // ========================================

    return "en-IN";
}


// ============================================
// VOICE CONTROLLER
// ============================================

async function voiceController(
    req,
    res
) {

    try {

        // ====================================
        // GET REQUEST DATA
        // ====================================

        const {
            audio,
            mimeType,
            language
        } = req.body || {};


        // ====================================
        // CHECK AUDIO
        // ====================================

        if (!audio) {

            return res.status(400).json({

                success: false,

                message:
                    "Audio data is required."

            });

        }


        // ====================================
        // AUDIO STRING
        // ====================================

        const audioString =
            String(audio);


        console.log(
            "\n================================="
        );

        console.log(
            "===== VOICE REQUEST ====="
        );

        console.log(
            "Received audio string length:",
            audioString.length
        );

        console.log(
            "Received MIME type:",
            mimeType
        );


        // ====================================
        // EXTRACT BASE64
        // ====================================

        const base64Audio =
            audioString.includes(",")
                ? audioString.split(",")[1]
                : audioString;


        console.log(
            "Base64 length after extraction:",
            base64Audio.length
        );


        // ====================================
        // CONVERT BASE64 → BUFFER
        // ====================================

        const audioBuffer =
            Buffer.from(
                base64Audio,
                "base64"
            );


        console.log(
            "Decoded audio buffer size:",
            audioBuffer.length,
            "bytes"
        );


        // ====================================
        // VALIDATE AUDIO
        // ====================================

        if (
            !audioBuffer ||
            audioBuffer.length < 1000
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Audio data is invalid or too small."

            });

        }


        // ====================================
        // SPEECH TO TEXT
        // ====================================

        console.log(
            "\n===== VOICE TRANSCRIPTION ====="
        );


        const text =
            await transcribeAudio(

                audioBuffer,

                mimeType ||
                "audio/webm"

            );


        // ====================================
        // CHECK TRANSCRIPTION
        // ====================================

        if (
            !text ||
            !String(text).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Could not understand the audio."

            });

        }


        console.log(
            "Transcription:",
            text
        );


        // ====================================
        // DETECT LANGUAGE
        // ====================================

        let detectedLanguage =
            detectLanguage(text);


        /*
         * If frontend explicitly sends a
         * language, we can use it.
         *
         * Otherwise automatically detect
         * from the transcription.
         */

        if (
            language &&
            typeof language === "string"
        ) {

            const requested =
                language
                    .trim()
                    .toLowerCase();


            if (
                requested === "tamil" ||
                requested === "ta" ||
                requested === "ta-in"
            ) {

                detectedLanguage = "ta-IN";

            }

            else if (
                requested === "hindi" ||
                requested === "hi" ||
                requested === "hi-in"
            ) {

                detectedLanguage = "hi-IN";

            }

            else if (
                requested === "telugu" ||
                requested === "te" ||
                requested === "te-in"
            ) {

                detectedLanguage = "te-IN";

            }

            else if (
                requested === "english" ||
                requested === "en" ||
                requested === "en-in"
            ) {

                detectedLanguage = "en-IN";

            }

        }


        console.log(
            "Detected language:",
            detectedLanguage
        );


        // ====================================
        // TEXT TO SPEECH
        // ====================================

        let speechAudio = null;


        try {

            console.log(
                "\n===== TEXT TO SPEECH ====="
            );

            console.log(
                "Language:",
                detectedLanguage
            );

            console.log(
                "Text:",
                text
            );


            const speechBuffer =
                await textToSpeech(

                    text,

                    detectedLanguage

                );


            // =================================
            // CONVERT AUDIO → BASE64
            // =================================

            speechAudio =
                speechBuffer.toString(
                    "base64"
                );


            console.log(
                "Generated TTS audio size:",
                speechBuffer.length,
                "bytes"
            );


            console.log(
                "TTS Base64 size:",
                speechAudio.length
            );


            console.log(
                "TTS generation successful."
            );

        }

        catch (ttsError) {

            console.error(
                "\n===== TTS ERROR ====="
            );

            console.error(
                ttsError
            );

            console.error(
                "=====================\n"
            );


            speechAudio = null;

        }


        // ====================================
        // FINAL RESPONSE
        // ====================================

        console.log(
            "\n===== VOICE RESPONSE ====="
        );

        console.log(
            "Transcription:",
            text
        );

        console.log(
            "Detected language:",
            detectedLanguage
        );

        console.log(
            "TTS available:",
            speechAudio !== null
        );

        console.log(
            "==========================\n"
        );


        return res.json({

            success: true,

            // Transcribed user speech
            text:
                text,

            // IMPORTANT:
            // Return generated Sarvam audio,
            // NOT the original microphone audio.
            audio:
                speechAudio
                    ? `data:audio/wav;base64,${speechAudio}`
                    : null,

            audioMimeType:
                "audio/wav",

            language:
                detectedLanguage,

            ttsAvailable:
                speechAudio !== null

        });

    }


    catch (error) {

        console.error(
            "\n===== VOICE CONTROLLER ERROR ====="
        );

        console.error(
            error
        );

        console.error(
            "==================================\n"
        );


        return res.status(500).json({

            success: false,

            message:
                "Voice processing failed.",

            error:
                error.message

        });

    }

}


// ============================================
// EXPORT
// ============================================

module.exports = {

    voiceController

};