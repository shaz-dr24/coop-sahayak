// ============================================================
// SARVAM TEXT TO SPEECH SERVICE
// ============================================================

const SARVAM_TTS_URL =
    "https://api.sarvam.ai/text-to-speech";


// ============================================================
// LANGUAGE MAP
// ============================================================

const LANGUAGE_MAP = {

    english: "en-IN",
    en: "en-IN",
    "en-IN": "en-IN",

    tamil: "ta-IN",
    ta: "ta-IN",
    "ta-IN": "ta-IN",

    hindi: "hi-IN",
    hi: "hi-IN",
    "hi-IN": "hi-IN",

    telugu: "te-IN",
    te: "te-IN",
    "te-IN": "te-IN"

};


// ============================================================
// VOICE MAP
// ============================================================

/*
    Sarvam recommended female voices:

    Tamil   -> ishita
    Hindi   -> priya
    Telugu  -> neha
    English -> priya

    We can change these later after testing.
*/

const SPEAKER_MAP = {

    "en-IN": "priya",

    "ta-IN": "ishita",

    "hi-IN": "priya",

    "te-IN": "neha"

};


// ============================================================
// GET LANGUAGE CODE
// ============================================================

function getLanguageCode(language) {

    if (!language) {

        return "en-IN";

    }

    const value =
        String(language)
            .trim()
            .toLowerCase();

    return (
        LANGUAGE_MAP[value] ||
        "en-IN"
    );

}


// ============================================================
// GET SPEAKER
// ============================================================

function getSpeaker(languageCode) {

    return (
        SPEAKER_MAP[languageCode] ||
        "priya"
    );

}


// ============================================================
// TEXT TO SPEECH
// ============================================================

async function textToSpeech(
    text,
    language = "en-IN"
) {

    // --------------------------------------------------------
    // CHECK TEXT
    // --------------------------------------------------------

    if (
        !text ||
        !String(text).trim()
    ) {

        throw new Error(
            "TTS text is empty."
        );

    }


    // --------------------------------------------------------
    // CHECK API KEY
    // --------------------------------------------------------

    if (
        !process.env.SARVAM_API_KEY
    ) {

        throw new Error(
            "SARVAM_API_KEY is missing from .env"
        );

    }


    const cleanText =
        String(text)
            .trim()
            .substring(0, 2500);


    const languageCode =
        getLanguageCode(language);


    const speaker =
        getSpeaker(languageCode);


    console.log(
        "\n===== SARVAM TTS ====="
    );

    console.log(
        "Text:",
        cleanText
    );

    console.log(
        "Language:",
        languageCode
    );

    console.log(
        "Speaker:",
        speaker
    );


    try {

        // ----------------------------------------------------
        // CALL SARVAM
        // ----------------------------------------------------

        const response =
            await fetch(
                SARVAM_TTS_URL,
                {

                    method: "POST",

                    headers: {

                        "api-subscription-key":
                            process.env.SARVAM_API_KEY,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            text:
                                cleanText,

                            language_code:
                                languageCode,

                            speaker:
                                speaker,

                            model:
                                "bulbul:v3",

                            pace:
                                1.0,

                            temperature:
                                0.6,

                            speech_sample_rate:
                                24000

                        })

                }
            );


        // ----------------------------------------------------
        // READ RESPONSE
        // ----------------------------------------------------

        const data =
            await response.json();


        // ----------------------------------------------------
        // CHECK ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            console.error(
                "Sarvam HTTP status:",
                response.status
            );

            console.error(
                "Sarvam response:",
                data
            );

            throw new Error(
                `Sarvam TTS failed: ${JSON.stringify(data)
                }`
            );

        }


        // ----------------------------------------------------
        // CHECK AUDIO
        // ----------------------------------------------------

        if (
            !data ||
            !data.audios ||
            !data.audios.length
        ) {

            throw new Error(
                "Sarvam returned no audio."
            );

        }


        const audio =
            data.audios[0];


        console.log(
            "Sarvam audio generated."
        );

        console.log(
            "Base64 size:",
            audio.length
        );

        console.log(
            "======================\n"
        );


        return {

            audio,

            audioMimeType:
                "audio/wav",

            language:
                languageCode,

            speaker

        };

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

    textToSpeech,

    getLanguageCode,

    getSpeaker

};