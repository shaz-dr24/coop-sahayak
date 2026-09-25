const fs = require("fs");
const path = require("path");
const os = require("os");
const Groq = require("groq-sdk");


// ============================================================
// GROQ CLIENT
// Used ONLY for Speech-to-Text
// ============================================================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


// ============================================================
// SARVAM CONFIGURATION
// Used ONLY for Text-to-Speech
// ============================================================

const SARVAM_API_KEY =
    process.env.SARVAM_API_KEY;

const SARVAM_TTS_URL =
    "https://api.sarvam.ai/text-to-speech";


// ============================================================
// TRANSCRIBE AUDIO
// ============================================================

async function transcribeAudio(
    audioBuffer,
    mimeType = "audio/webm"
) {

    if (
        !audioBuffer ||
        audioBuffer.length === 0
    ) {

        throw new Error(
            "Audio data is empty."
        );
    }


    console.log(
        "\n===== VOICE TRANSCRIPTION ====="
    );

    console.log(
        "Received audio size:",
        audioBuffer.length,
        "bytes"
    );

    console.log(
        "Received MIME type:",
        mimeType
    );


    // ========================================================
    // TEMPORARY WEBM FILE
    // ========================================================

    const tempFile =
        path.join(
            os.tmpdir(),
            `coop-sahayak-${Date.now()}.webm`
        );


    try {

        // ====================================================
        // WRITE AUDIO
        // ====================================================

        fs.writeFileSync(
            tempFile,
            audioBuffer
        );


        console.log(
            "Temporary file:",
            tempFile
        );

        console.log(
            "Temporary file size:",
            fs.statSync(tempFile).size,
            "bytes"
        );


        // ====================================================
        // FILE STREAM
        // ====================================================

        const fileStream =
            fs.createReadStream(
                tempFile
            );


        // ====================================================
        // GROQ WHISPER
        // ====================================================

        const transcription =
            await groq.audio.transcriptions.create({

                file: fileStream,

                model:
                    "whisper-large-v3-turbo",

                response_format:
                    "json",

                temperature:
                    0

            });


        // ====================================================
        // GET TRANSCRIPTION
        // ====================================================

        const text =
            String(
                transcription.text || ""
            ).trim();


        console.log(
            "Transcription:",
            text
        );


        console.log(
            "===============================\n"
        );


        return text;

    }

    catch (error) {

        console.error(
            "\n===== GROQ VOICE ERROR ====="
        );

        console.error(
            error.message
        );

        console.error(
            "============================\n"
        );

        throw error;

    }

    finally {

        // ====================================================
        // DELETE TEMP FILE
        // ====================================================

        if (
            fs.existsSync(tempFile)
        ) {

            fs.unlinkSync(
                tempFile
            );

            console.log(
                "Temporary audio file deleted."
            );
        }

    }

}


// ============================================================
// CLEAN TEXT FOR TTS
// ============================================================

function cleanTextForSpeech(text) {

    return String(text || "")

        // Remove markdown bold
        .replace(/\*\*/g, "")

        // Remove markdown italic
        .replace(/__/g, "")

        // Remove markdown headings
        .replace(/^#+\s*/gm, "")

        // Remove markdown bullets
        .replace(/^\s*[-*•]\s*/gm, "")

        // Remove backticks
        .replace(/`/g, "")

        // Remove excessive whitespace
        .replace(/\n+/g, ". ")

        .replace(/\s+/g, " ")

        .trim();

}


// ============================================================
// NORMALIZE LANGUAGE
// ============================================================

function normalizeLanguage(language) {

    const value =
        String(language || "")
            .trim()
            .toLowerCase();


    // Tamil
    if (
        value === "ta" ||
        value === "ta-in" ||
        value.includes("tamil")
    ) {

        return "ta-IN";
    }


    // English
    if (
        value === "en" ||
        value === "en-in" ||
        value.includes("english")
    ) {

        return "en-IN";
    }


    // Hindi
    if (
        value === "hi" ||
        value === "hi-in" ||
        value.includes("hindi")
    ) {

        return "hi-IN";
    }


    // Telugu
    if (
        value === "te" ||
        value === "te-in" ||
        value.includes("telugu")
    ) {

        return "te-IN";
    }


    // Kannada
    if (
        value === "kn" ||
        value === "kn-in" ||
        value.includes("kannada")
    ) {

        return "kn-IN";
    }


    // Malayalam
    if (
        value === "ml" ||
        value === "ml-in" ||
        value.includes("malayalam")
    ) {

        return "ml-IN";
    }


    // Bengali
    if (
        value === "bn" ||
        value === "bn-in" ||
        value.includes("bengali")
    ) {

        return "bn-IN";
    }


    // Marathi
    if (
        value === "mr" ||
        value === "mr-in" ||
        value.includes("marathi")
    ) {

        return "mr-IN";
    }


    // Gujarati
    if (
        value === "gu" ||
        value === "gu-in" ||
        value.includes("gujarati")
    ) {

        return "gu-IN";
    }


    // Punjabi
    if (
        value === "pa" ||
        value === "pa-in" ||
        value.includes("punjabi")
    ) {

        return "pa-IN";
    }


    // Odia
    if (
        value === "od" ||
        value === "od-in" ||
        value.includes("odia")
    ) {

        return "od-IN";
    }


    // Default
    return "en-IN";

}


// ============================================================
// SELECT SARVAM SPEAKER
// ============================================================

function getSpeaker(languageCode) {

    switch (languageCode) {

        case "ta-IN":
            return "ritu";

        case "hi-IN":
            return "priya";

        case "te-IN":
            return "neha";

        case "kn-IN":
            return "ishita";

        case "ml-IN":
            return "pooja";

        case "bn-IN":
            return "roopa";

        case "mr-IN":
            return "ritu";

        case "gu-IN":
            return "ritu";

        case "pa-IN":
            return "roopa";

        case "od-IN":
            return "ritu";

        case "en-IN":
        default:
            return "ishita";

    }

}


// ============================================================
// SARVAM TEXT TO SPEECH
// ============================================================

async function textToSpeech(
    text,
    language = "en-IN"
) {

    // ========================================================
    // CLEAN TEXT
    // ========================================================

    const cleanText =
        cleanTextForSpeech(text);


    if (!cleanText) {

        throw new Error(
            "Text for speech is empty."
        );

    }


    // ========================================================
    // NORMALIZE LANGUAGE
    // ========================================================

    const languageCode =
        normalizeLanguage(language);


    // ========================================================
    // SELECT SPEAKER
    // ========================================================

    const speaker =
        getSpeaker(languageCode);


    console.log(
        "\n===== TEXT TO SPEECH ====="
    );

    console.log(
        "Original language:",
        language
    );

    console.log(
        "Normalized language:",
        languageCode
    );

    console.log(
        "Speaker:",
        speaker
    );

    console.log(
        "Text:",
        cleanText
    );


    // ========================================================
    // CHECK API KEY
    // ========================================================

    if (!SARVAM_API_KEY) {

        throw new Error(
            "SARVAM_API_KEY is missing in .env"
        );

    }


    try {

        // ====================================================
        // SARVAM REQUEST
        // ====================================================

        const response =
            await fetch(
                SARVAM_TTS_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "api-subscription-key":
                            SARVAM_API_KEY

                    },

                    body:
                        JSON.stringify({

                            text:
                                cleanText.substring(
                                    0,
                                    2500
                                ),

                            target_language_code:
                                languageCode,

                            language_code:
                                languageCode,

                            model:
                                "bulbul:v3",

                            speaker:
                                speaker,

                            pace:
                                1.0,

                            output_audio_codec:
                                "wav"

                        })

                }
            );


        // ====================================================
        // CHECK HTTP STATUS
        // ====================================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "\n===== SARVAM TTS ERROR ====="
            );

            console.error(
                "Status:",
                response.status
            );

            console.error(
                "Response:",
                errorText
            );

            console.error(
                "============================\n"
            );


            throw new Error(
                `Sarvam TTS failed: ${response.status} ${errorText}`
            );

        }


        // ====================================================
        // PARSE RESPONSE
        // ====================================================

        const data =
            await response.json();


        // ====================================================
        // GET BASE64 AUDIO
        // ====================================================

        if (
            !data ||
            !data.audios ||
            !data.audios.length
        ) {

            throw new Error(
                "Sarvam TTS returned no audio."
            );

        }


        const base64Audio =
            data.audios[0];


        // ====================================================
        // BASE64 → BUFFER
        // ====================================================

        const audioBuffer =
            Buffer.from(
                base64Audio,
                "base64"
            );


        console.log(
            "Generated TTS audio size:",
            audioBuffer.length,
            "bytes"
        );

        console.log(
            "Sarvam TTS generation successful."
        );

        console.log(
            "==========================\n"
        );


        return audioBuffer;

    }

    catch (error) {

        console.error(
            "\n===== SARVAM TTS ERROR ====="
        );

        console.error(
            error.message
        );

        console.error(
            "============================\n"
        );


        throw error;

    }

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    transcribeAudio,

    textToSpeech

};