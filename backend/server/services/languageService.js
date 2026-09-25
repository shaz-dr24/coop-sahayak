const Groq = require("groq-sdk");


// ============================================
// GROQ CLIENT
// ============================================

const groq = new Groq({

    apiKey:
        process.env.GROQ_API_KEY

});


// ============================================
// DETECT LANGUAGE
// ============================================

async function detectLanguage(message) {

    const text =
        String(message || "")
            .trim();


    if (!text) {

        return "UNKNOWN";
    }


    // ========================================
    // TAMIL SCRIPT
    // ========================================

    if (
        /[\u0B80-\u0BFF]/.test(text)
    ) {

        return "TAMIL";
    }


    // ========================================
    // HINDI SCRIPT
    // ========================================

    if (
        /[\u0900-\u097F]/.test(text)
    ) {

        return "HINDI";
    }


    // ========================================
    // GROQ CLASSIFICATION
    // ========================================

    const response =
        await groq.chat.completions.create({

            model:
                "openai/gpt-oss-120b",

            temperature: 0,

            messages: [

                {

                    role: "system",

                    content: `
You are a language classifier.

Classify the user's message into exactly ONE
of these labels:

ENGLISH
TAMIL
HINDI
TANGLISH
HINGLISH
MIXED

Definitions:

ENGLISH:
Normal English written mainly in Latin script.

TAMIL:
Tamil language written in Tamil script.

HINDI:
Hindi language written in Devanagari script.

TANGLISH:
Tamil language written using English/Latin letters.

Examples:
"enna panrathu"
"claim varala"
"slnga help pannunga"

HINGLISH:
Hindi language written using English/Latin letters.

Examples:
"mera paisa nahi aaya"
"kaise apply karna hai"

MIXED:
The message genuinely contains substantial
content from multiple languages.

Important:

- Do not translate.
- Do not explain.
- Do not add punctuation.
- Return ONLY one label.
`
                },

                {

                    role: "user",

                    content:
                        text

                }

            ]

        });


    // ========================================
    // CLEAN RESULT
    // ========================================

    const result =
        response
            .choices[0]
            .message
            .content
            .trim()
            .toUpperCase();


    // ========================================
    // VALID LABELS
    // ========================================

    const validLanguages = [

        "ENGLISH",
        "TAMIL",
        "HINDI",
        "TANGLISH",
        "HINGLISH",
        "MIXED"

    ];


    if (
        validLanguages.includes(result)
    ) {

        return result;
    }


    // ========================================
    // FALLBACK
    // ========================================

    return "ENGLISH";
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    detectLanguage

};