const Groq = require("groq-sdk");


// ============================================
// GROQ CLIENT
// ============================================

const groq = new Groq({

    apiKey:
        process.env.GROQ_API_KEY

});


// ============================================
// TRANSLATE TEXT
// ============================================

async function translateText(
    text,
    targetLanguage
) {

    // ========================================
    // EMPTY TEXT
    // ========================================

    if (!text) {

        return "";
    }


    // ========================================
    // NORMALIZE LANGUAGE
    // ========================================

    const language =
        String(
            targetLanguage || "ENGLISH"
        )
            .trim()
            .toUpperCase();


    // ========================================
    // ENGLISH
    // ========================================

    if (
        language === "ENGLISH"
    ) {

        return text;
    }


    // ========================================
    // TARGET LANGUAGE DESCRIPTION
    // ========================================

    const languageMap = {

        TAMIL:
            "Tamil",

        HINDI:
            "Hindi",

        TANGLISH:
            "Tamil written using English/Latin letters",

        HINGLISH:
            "Hindi written using English/Latin letters"

    };


    const target =
        languageMap[language];


    // ========================================
    // UNKNOWN LANGUAGE
    // ========================================

    if (!target) {

        return text;
    }


    // ========================================
    // GROQ TRANSLATION
    // ========================================

    const response =
        await groq.chat.completions.create({

            model:
                "openai/gpt-oss-120b",

            temperature: 0,

            messages: [

                // ====================================
                // SYSTEM PROMPT
                // ====================================

                {

                    role: "system",

                    content: `
You are the translation component of
Coop Sahayak AI.

Your task is to convert the provided response
into the requested language/style.

TARGET LANGUAGE:
${target}

IMPORTANT RULES:

1. Preserve the exact meaning.

2. Do NOT add new information.

3. Do NOT remove important information.

4. Do NOT answer the user's question yourself.

5. Only translate or rewrite the provided text.

6. Keep government scheme names unchanged.

Examples:
PMFBY → PMFBY
KCC → KCC
PACS → PACS

7. Keep Ticket IDs unchanged.

Example:
GRV-PMFBY-94034225
must remain:
GRV-PMFBY-94034225

8. Keep policy/application/reference numbers unchanged.

9. Keep numerical values unchanged.

10. Keep dates unchanged.

11. Keep statuses unchanged when they are system
values such as:

REGISTERED
IN_PROGRESS
ESCALATED
CANCELLED

12. Keep the structure of the response.
If the original contains numbered steps,
keep numbered steps.

13. If the target is TANGLISH:
Write Tamil using English/Latin letters.

Example:
"Ungal grievance successfully register
seyyappattullathu."

Do NOT use Tamil Unicode characters.

14. If the target is HINGLISH:
Write Hindi using English/Latin letters.

Example:
"Aapki grievance successfully register
ho gayi hai."

Do NOT use Devanagari characters.

15. If the target is TAMIL:
Use normal Tamil script.

16. If the target is HINDI:
Use normal Hindi/Devanagari script.

17. Do not add explanations such as:
"Here is the translation."

18. Return ONLY the translated text.
`
                },


                // ====================================
                // USER CONTENT
                // ====================================

                {

                    role: "user",

                    content:
                        text

                }

            ]

        });


    // ========================================
    // EXTRACT RESULT
    // ========================================

    const translated =
        response
            ?.choices?.[0]
            ?.message?.content
            ?.trim();


    // ========================================
    // SAFETY FALLBACK
    // ========================================

    if (!translated) {

        return text;
    }


    return translated;
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    translateText

};