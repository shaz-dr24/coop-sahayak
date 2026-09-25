const Groq = require("groq-sdk");


// ============================================
// GROQ CLIENT
// ============================================

const groq = new Groq({
    apiKey:
        process.env.GROQ_API_KEY
});


// ============================================
// NORMALIZE TEXT
// ============================================

function normalizeText(text) {

    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


// ============================================
// DETECT CONFIRMATION
// ============================================

function detectConfirmation(text) {

    const q =
        normalizeText(text);


    const confirmations = [

        // ========================================
        // TAMIL
        // ========================================

        "ஆம்",
        "ஆமாம்",
        "சரி",
        "ஆமாம் சரி",
        "ஆம் சரி",
        "சரிதான்",
        "தகவல் சரி",
        "எல்லாம் சரி",
        "சரியாக உள்ளது",
        "சரியாக இருக்கு",
        "சரி உள்ளது",
        "ஆமாம் தகவல் சரி",
        "ஆம் தகவல் சரி",
        "பதிவு செய்யலாம்",
        "பதிவு செய்யுங்கள்",
        "புகார் பதிவு செய்யலாம்",
        "புகார் பதிவு செய்யுங்கள்",


        // ========================================
        // HINDI
        // ========================================

        "हाँ",
        "हां",
        "ठीक है",
        "सही है",
        "हाँ सही है",
        "हां सही है",
        "बिल्कुल सही",
        "सब सही है",
        "पंजीकृत करें",
        "शिकायत दर्ज करें",


        // ========================================
        // ENGLISH
        // ========================================

        "yes",
        "yes that's right",
        "yes that is right",
        "yes correct",
        "correct",
        "that's correct",
        "that is correct",
        "looks good",
        "confirmed",
        "confirm",
        "okay",
        "ok",
        "okay proceed",
        "proceed",
        "yes proceed",


        // ========================================
        // TANGLISH
        // ========================================

        "aamam",
        "aamam sari",
        "amam",
        "amam sari",
        "ama",
        "ama sari",
        "sari",
        "sari than",
        "sarit han",
        "thagaval sari",
        "ellam sari",
        "correct ah iruku",
        "correct ah irukku",
        "sari ah iruku",
        "sari ah irukku",
        "register pannunga",
        "complaint register pannunga",
        "pugaar register pannunga"

    ];


    return confirmations.includes(q);

}


// ============================================
// DETECT EDIT
// ============================================

function detectEdit(text) {

    const q =
        normalizeText(text);


    const editPhrases = [

        // ========================================
        // TAMIL
        // ========================================

        "இல்லை",
        "வேண்டாம்",
        "தவறு",
        "தகவல் தவறு",
        "சரி இல்லை",
        "மாற்ற வேண்டும்",
        "மாற்றவும்",
        "திருத்த வேண்டும்",
        "திருத்தவும்",
        "தவறாக உள்ளது",
        "தவறாக இருக்கு",
        "மாற்றணும்",


        // ========================================
        // HINDI
        // ========================================

        "नहीं",
        "गलत है",
        "बदलना है",
        "सुधारना है",
        "जानकारी गलत है",


        // ========================================
        // ENGLISH
        // ========================================

        "no",
        "no that's wrong",
        "no that is wrong",
        "wrong",
        "incorrect",
        "edit",
        "change",
        "change it",
        "modify",
        "that's wrong",


        // ========================================
        // TANGLISH
        // ========================================

        "illa",
        "illa thappu",
        "thappu",
        "thagaval thappu",
        "change pannanum",
        "maathanum",
        "edit pannanum"

    ];


    return editPhrases.includes(q);

}


// ============================================
// EXTRACT REFERENCE NUMBER
// ============================================

function extractReferenceNumber(text) {

    const value =
        String(text || "").trim();


    /*
     * Examples:
     *
     * PM12345678
     * PMFBY12345678
     * KCC123456
     * 12345678
     */

    const match =
        value.match(
            /\b[A-Za-z]{0,8}[-/]?\d{4,20}\b/
        );


    if (match) {

        return match[0];

    }


    return null;

}


// ============================================
// INFORMATION QUESTION DETECTION
// ============================================

function looksLikeInformationQuestion(text) {

    const q =
        normalizeText(text);


    const informationPatterns = [

        // ========================================
        // ENGLISH
        // ========================================

        "what is",
        "what are",
        "who can",
        "who are eligible",
        "how can i",
        "how do i",
        "how to",
        "can i get",
        "can i apply",
        "what should i do",
        "what can i do",
        "what are my options",
        "tell me about",
        "explain",
        "information about",
        "details about",
        "eligibility",
        "documents required",
        "why",
        "where",
        "when",


        // ========================================
        // TAMIL
        // ========================================

        "என்றால் என்ன",
        "என்ன",
        "யாரெல்லாம்",
        "தகுதியானவர்கள்",
        "எப்படி",
        "என்ன செய்யலாம்",
        "என்ன செய்ய வேண்டும்",
        "தகவல்",
        "பற்றி கூறுங்கள்",
        "பற்றி சொல்லுங்கள்",
        "விவரங்கள்",
        "தகுதி",
        "ஆவணங்கள்",
        "தேவை",
        "ஏன்",
        "எங்கே",
        "எப்போது",


        // ========================================
        // HINDI
        // ========================================

        "क्या है",
        "कौन पात्र",
        "कौन पात्र हैं",
        "कैसे",
        "क्या करना चाहिए",
        "जानकारी",
        "विवरण",
        "दस्तावेज",
        "पात्रता",
        "क्यों",
        "कहाँ",
        "कब"

    ];


    return informationPatterns.some(
        phrase =>
            q.includes(phrase)
    );

}


// ============================================
// EXPLICIT COMPLAINT DETECTION
// ============================================

function explicitlyWantsComplaint(text) {

    const q =
        normalizeText(text);


    const complaintPatterns = [

        // ========================================
        // ENGLISH
        // ========================================

        "file a complaint",
        "file complaint",
        "register a complaint",
        "register complaint",
        "raise a complaint",
        "raise complaint",
        "submit a complaint",
        "submit complaint",
        "file a grievance",
        "register a grievance",
        "raise a grievance",
        "submit a grievance",
        "make a complaint",
        "complaint register",
        "complaint registration",
        "i want to complain",
        "i want to file",
        "i want to register",
        "please register my complaint",
        "please file my complaint",


        // ========================================
        // TAMIL
        // ========================================

        "புகார் பதிவு",
        "புகார் கொடுக்க",
        "புகார் அளிக்க",
        "புகார் செய்ய",
        "புகார் தர",
        "புகார் வேண்டும்",
        "புகார் பதிவு செய்ய வேண்டும்",
        "புகார் பதிவு செய்யுங்கள்",
        "புகார் பதிவு செய்யலாம்",
        "குறை பதிவு",
        "குறை தீர்வு வேண்டும்",


        // ========================================
        // HINDI
        // ========================================

        "शिकायत दर्ज",
        "शिकायत करना",
        "शिकायत करनी है",
        "शिकायत दर्ज करनी है",
        "शिकायत दर्ज करें",
        "शिकायत करना है",
        "शिकायत चाहिए",


        // ========================================
        // TANGLISH
        // ========================================

        "complaint register pannanum",
        "complaint register pannunga",
        "complaint podanum",
        "complaint poda venum",
        "pugaar register pannanum",
        "pugaar register pannunga",
        "pugaar podanum",
        "complaint venum"

    ];


    return complaintPatterns.some(
        phrase =>
            q.includes(phrase)
    );

}


// ============================================
// CLASSIFY MESSAGE
// ============================================

async function classifyMessage(
    message,
    session = null
) {

    const text =
        String(message || "").trim();


    // ========================================
    // EMPTY MESSAGE
    // ========================================

    if (!text) {

        return {

            intent:
                "NORMAL",

            service:
                "GENERAL",

            problem:
                "GENERAL",

            referenceNumber:
                null,

            ticketId:
                null,

            confidence:
                0

        };

    }


    // ========================================
    // CURRENT SESSION STEP
    // ========================================

    const currentStep =
        session?.step || null;


    console.log(
        "\n===== INTENT CLASSIFICATION ====="
    );

    console.log(
        "Message:",
        text
    );

    console.log(
        "Current session step:",
        currentStep
    );


    // ============================================================
    // CONFIRMATION
    // ============================================================

    /*
     * ONLY treat short YES/NO type messages as
     * confirmation/edit when the application is
     * actually waiting for confirmation.
     */

    if (
        currentStep ===
        "WAITING_FOR_CONFIRMATION"
    ) {

        if (
            detectConfirmation(text)
        ) {

            console.log(
                "Detected CONFIRM locally."
            );


            return {

                intent:
                    "CONFIRM",

                service:
                    session?.service ||
                    "GENERAL",

                problem:
                    session?.problem ||
                    "GENERAL",

                referenceNumber:
                    session?.policyNumber ||
                    session?.referenceNumber ||
                    null,

                ticketId:
                    session?.ticketId ||
                    null,

                confidence:
                    1.0

            };

        }


        if (
            detectEdit(text)
        ) {

            console.log(
                "Detected EDIT locally."
            );


            return {

                intent:
                    "EDIT",

                service:
                    session?.service ||
                    "GENERAL",

                problem:
                    session?.problem ||
                    "GENERAL",

                referenceNumber:
                    session?.policyNumber ||
                    session?.referenceNumber ||
                    null,

                ticketId:
                    session?.ticketId ||
                    null,

                confidence:
                    1.0

            };

        }

    }


    // ============================================================
    // POLICY NUMBER
    // ============================================================

    /*
     * Only extract a policy number automatically
     * when the application is actually waiting
     * for one.
     */

    if (
        currentStep ===
        "WAITING_FOR_POLICY_NUMBER"
    ) {

        const referenceNumber =
            extractReferenceNumber(text);


        if (referenceNumber) {

            console.log(
                "Detected reference number locally:",
                referenceNumber
            );


            return {

                intent:
                    "POLICY_NUMBER",

                service:
                    session?.service ||
                    "GENERAL",

                problem:
                    session?.problem ||
                    "GENERAL",

                referenceNumber:
                    referenceNumber,

                ticketId:
                    session?.ticketId ||
                    null,

                confidence:
                    1.0

            };

        }

    }


    // ========================================
    // LOCAL INFORMATION QUESTION CHECK
    // ========================================

    const informationQuestion =
        looksLikeInformationQuestion(text);


    // ========================================
    // LOCAL EXPLICIT COMPLAINT CHECK
    // ========================================

    const explicitComplaint =
        explicitlyWantsComplaint(text);


    // ============================================================
    // CLEAR INFORMATION QUESTION
    // ============================================================

    /*
     * If the user is clearly asking for information,
     * never start a grievance.
     */

    if (
        informationQuestion &&
        !explicitComplaint
    ) {

        console.log(
            "Local classification: NORMAL information question"
        );


        // We still use Groq below to determine
        // the correct service.

    }


    // ========================================
    // SESSION CONTEXT
    // ========================================

    /*
     * Session information is provided to Groq
     * only as CONTEXT.
     *
     * It is NOT authoritative.
     *
     * CURRENT USER MESSAGE always has priority.
     */

    const sessionContext =
        session
            ? JSON.stringify(
                {

                    service:
                        session.service,

                    problem:
                        session.problem,

                    policyNumber:
                        session.policyNumber,

                    referenceNumber:
                        session.referenceNumber,

                    description:
                        session.description,

                    ticketId:
                        session.ticketId,

                    status:
                        session.status,

                    step:
                        session.step

                },
                null,
                2
            )
            : "No active grievance session.";


    // ========================================
    // GROQ
    // ========================================

    let response;


    try {

        response =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                temperature:
                    0,

                max_tokens:
                    300,

                response_format: {

                    type:
                        "json_object"

                },

                messages: [

                    // ====================================
                    // SYSTEM
                    // ====================================

                    {

                        role:
                            "system",

                        content: `

You are the intent understanding engine
for Coop Sahayak AI.

Your job is to classify ONLY the CURRENT
USER MESSAGE.

You understand:

- English
- Tamil
- Hindi
- Tanglish
- Hinglish
- Telugu
- mixed languages
- spelling mistakes
- speech-to-text mistakes
- abbreviations
- informal language.


==================================================
CRITICAL RULE
==================================================

The CURRENT USER MESSAGE has priority.

An old session MUST NOT force a new message
into a grievance.


==================================================
MOST IMPORTANT DISTINCTION
==================================================

There is a very important difference between:

A) A USER DESCRIBING A PROBLEM

and

B) A USER EXPLICITLY ASKING TO REGISTER
   A COMPLAINT/GRIEVANCE.


==================================================
NORMAL PROBLEM DESCRIPTION
==================================================

If the user only describes a problem,
classify it as NORMAL.

Examples:

"என் காப்பீட்டு தொகை இன்னும் வரவில்லை"
→ NORMAL
→ PMFBY
→ CLAIM_NOT_RECEIVED

"மற்ற விவசாயிகளுக்கு பணம் வந்துவிட்டது,
எனக்கு மட்டும் வரவில்லை"
→ NORMAL
→ PMFBY
→ CLAIM_NOT_RECEIVED

"My crop insurance money has not arrived"
→ NORMAL
→ PMFBY
→ CLAIM_NOT_RECEIVED

"My claim was rejected"
→ NORMAL
→ PMFBY
→ CLAIM_REJECTED

"என் வங்கி கடன் கிடைக்கவில்லை"
→ NORMAL
→ BANKING
→ LOAN_PROBLEM

The user is describing a situation.

They have NOT necessarily asked to register
a complaint.


==================================================
NORMAL INFORMATION QUESTIONS
==================================================

If the user is asking for:

- information
- advice
- eligibility
- explanation
- documents
- benefits
- procedure
- farming options
- what to do
- how to do something
- why something happened
- where to go

classify as NORMAL.

Examples:

"கிசான் கிரெடிட் கார்டு என்றால் என்ன?"
→ NORMAL

"What is KCC?"
→ NORMAL

"Who is eligible for KCC?"
→ NORMAL

"காப்பீட்டு தொகை வரவில்லை என்ன செய்யலாம்?"
→ NORMAL

"What should I do if my insurance payment
has not arrived?"
→ NORMAL


==================================================
NEW GRIEVANCE
==================================================

Use NEW_GRIEVANCE ONLY when the user explicitly
wants to register, file, raise, submit or make
a complaint/grievance.

Examples:

"புகார் பதிவு செய்ய வேண்டும்"
→ NEW_GRIEVANCE

"என் காப்பீட்டு தொகை வரவில்லை.
புகார் பதிவு செய்ய வேண்டும்."
→ NEW_GRIEVANCE

"Please register my complaint"
→ NEW_GRIEVANCE

"I want to file a grievance"
→ NEW_GRIEVANCE

"Complaint register pannunga"
→ NEW_GRIEVANCE

"என் claim rejected ஆகிவிட்டது.
இதற்கு complaint பதிவு செய்ய வேண்டும்."
→ NEW_GRIEVANCE


==================================================
IMPORTANT
==================================================

DO NOT classify a message as NEW_GRIEVANCE
only because the user has a problem.

Problem alone ≠ complaint registration.

The following are NORMAL:

"payment not received"

"claim rejected"

"loan not received"

"என் காப்பீட்டு பணம் வரவில்லை"

"என்ன செய்யலாம்?"

Only explicit complaint registration should
be NEW_GRIEVANCE.


==================================================
AVAILABLE INTENTS
==================================================

Return exactly ONE:

NEW_GRIEVANCE
POLICY_NUMBER
DESCRIPTION
CONFIRM
EDIT
STATUS
ESCALATION
TICKET_ID
NORMAL


==================================================
POLICY_NUMBER
==================================================

The user provides a policy/application/
reference number.

Examples:

PM12345678
PMFBY12345678
KCC123456
12345678

Extract only if explicitly provided.

Never invent one.


==================================================
DESCRIPTION
==================================================

DESCRIPTION is used only when the application
is already inside an active grievance flow and
the user is providing or changing the grievance
description.

Do NOT use DESCRIPTION for a normal question.

Do NOT use DESCRIPTION merely because a session
exists.


==================================================
CONFIRM
==================================================

The user confirms displayed grievance details.

Examples:

ஆம்
ஆமாம்
சரி
ஆமாம் சரி
ஆம் சரி
சரிதான்
தகவல் சரி

yes
correct
confirmed
okay

हाँ
सही है
ठीक है


==================================================
EDIT
==================================================

The user says the displayed grievance information
is incorrect or wants to change it.

Examples:

இல்லை
தவறு
தகவல் தவறு
மாற்ற வேண்டும்
திருத்த வேண்டும்

no
wrong
incorrect
change it
edit

नहीं
गलत है
बदलना है


==================================================
STATUS
==================================================

The user wants the status of an EXISTING
grievance.

Examples:

"What is my complaint status?"

"என்னுடைய புகார் நிலை என்ன?"

"मेरी शिकायत की स्थिति क्या है?"


IMPORTANT:

A general question about a scheme is NOT STATUS.


==================================================
ESCALATION
==================================================

The user wants an EXISTING grievance moved
to a higher authority.


==================================================
TICKET_ID
==================================================

The user provides an existing grievance
ticket ID.


==================================================
SERVICE
==================================================

Possible values:

PMFBY
KCC
PACS
BANKING
GENERAL

Use the CURRENT MESSAGE to identify service.

Examples:

Crop insurance
→ PMFBY

Kisan Credit Card / KCC
→ KCC

Cooperative society / PACS
→ PACS

Bank account / banking
→ BANKING

If no service is clearly identified:
→ GENERAL


==================================================
PROBLEM
==================================================

Possible values:

PAYMENT_PROBLEM
CLAIM_NOT_RECEIVED
CLAIM_REJECTED
MEMBERSHIP_PROBLEM
LOAN_PROBLEM
PREMIUM_PROBLEM
GENERAL

Examples:

"crop insurance money not received"
→ CLAIM_NOT_RECEIVED

"insurance claim rejected"
→ CLAIM_REJECTED

"loan not received"
→ LOAN_PROBLEM

For NORMAL information questions:
→ GENERAL


==================================================
REFERENCE NUMBER
==================================================

Extract a policy/application/reference number
ONLY if explicitly provided.

Never invent one.

Otherwise:

null


==================================================
TICKET ID
==================================================

Extract a ticket ID ONLY if explicitly provided.

Never invent one.

Otherwise:

null


==================================================
SESSION RULE
==================================================

The session is context, NOT authority.

Use the session to understand short replies
such as:

"yes"
"சரி"
"ஆமாம்"
"no"
"இல்லை"

when the application is waiting for confirmation.

Use the session to understand a policy number
when the application is waiting for the number.

BUT:

If the user starts a NEW unrelated question,
classify that CURRENT question normally.

Example:

Session:
PMFBY grievance

User:
"KCC என்றால் என்ன?"

Correct:

{
  "intent": "NORMAL",
  "service": "KCC",
  "problem": "GENERAL"
}

Do NOT preserve PMFBY merely because the session
contains PMFBY.


==================================================
LANGUAGE
==================================================

The language does NOT change the intent.

Tamil, Hindi, English, Tanglish and Hinglish
must all be understood.


==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Exactly:

{
  "intent": "...",
  "service": "...",
  "problem": "...",
  "referenceNumber": null,
  "ticketId": null,
  "confidence": 0.0
}

confidence must be between 0 and 1.


==================================================
CURRENT SESSION
==================================================

${sessionContext}


==================================================
END SESSION
==================================================
`

                    },


                    // ====================================
                    // USER
                    // ====================================

                    {

                        role:
                            "user",

                        content:
                            text

                    }

                ]

            });

    }


    catch (error) {

        console.error(
            "\n===== GROQ INTENT ERROR ====="
        );

        console.error(
            error.message
        );

        console.error(
            "============================\n"
        );


        /*
         * IMPORTANT:
         *
         * NEVER return DESCRIPTION merely because
         * a session exists.
         *
         * If Groq fails, default to NORMAL.
         */

        return {

            intent:
                "NORMAL",

            service:
                "GENERAL",

            problem:
                "GENERAL",

            referenceNumber:
                null,

            ticketId:
                null,

            confidence:
                0

        };

    }


    // ========================================
    // PARSE RESULT
    // ========================================

    let result;


    try {

        result =
            JSON.parse(
                response
                    .choices[0]
                    .message
                    .content
            );

    }


    catch (error) {

        console.error(
            "Intent JSON parsing error:",
            error
        );


        return {

            intent:
                "NORMAL",

            service:
                "GENERAL",

            problem:
                "GENERAL",

            referenceNumber:
                null,

            ticketId:
                null,

            confidence:
                0

        };

    }


    // ========================================
    // VALID VALUES
    // ========================================

    const validIntents = [

        "NEW_GRIEVANCE",
        "POLICY_NUMBER",
        "DESCRIPTION",
        "CONFIRM",
        "EDIT",
        "STATUS",
        "ESCALATION",
        "TICKET_ID",
        "NORMAL"

    ];


    const validServices = [

        "PMFBY",
        "KCC",
        "PACS",
        "BANKING",
        "GENERAL"

    ];


    const validProblems = [

        "PAYMENT_PROBLEM",
        "CLAIM_NOT_RECEIVED",
        "CLAIM_REJECTED",
        "MEMBERSHIP_PROBLEM",
        "LOAN_PROBLEM",
        "PREMIUM_PROBLEM",
        "GENERAL"

    ];


    // ========================================
    // SAFE INTENT
    // ========================================

    let intent =
        validIntents.includes(
            result.intent
        )
            ? result.intent
            : "NORMAL";


    // ========================================
    // SAFE SERVICE
    // ========================================

    let service =
        validServices.includes(
            result.service
        )
            ? result.service
            : "GENERAL";


    // ========================================
    // SAFE PROBLEM
    // ========================================

    let problem =
        validProblems.includes(
            result.problem
        )
            ? result.problem
            : "GENERAL";


    // ============================================================
    // FINAL SAFETY:
    // INFORMATION QUESTIONS ARE ALWAYS NORMAL
    // ============================================================

    if (
        intent === "NEW_GRIEVANCE" &&
        informationQuestion &&
        !explicitComplaint
    ) {

        console.log(
            "Safety override: information question detected."
        );


        intent =
            "NORMAL";


        problem =
            "GENERAL";

    }


    // ============================================================
    // PROBLEM WITHOUT EXPLICIT COMPLAINT
    // ============================================================

    /*
     * This is the important new protection.
     *
     * If the user merely describes a problem,
     * do NOT start the grievance flow.
     *
     * Examples:
     *
     * "என் காப்பீட்டு தொகை வரவில்லை"
     * → NORMAL
     *
     * "My claim was rejected"
     * → NORMAL
     *
     * "Loan not received"
     * → NORMAL
     *
     * Only explicit complaint registration
     * becomes NEW_GRIEVANCE.
     */

    if (
        intent === "NEW_GRIEVANCE" &&
        !explicitComplaint
    ) {

        console.log(
            "Safety override: problem description without explicit complaint."
        );


        intent =
            "NORMAL";

    }


    // ============================================================
    // NORMAL QUESTIONS MUST NOT INHERIT OLD
    // GRIEVANCE PROBLEM
    // ============================================================

    if (
        intent === "NORMAL"
    ) {

        problem =
            problem !== "GENERAL" &&
                !informationQuestion
                ? problem
                : problem;

    }


    // ============================================================
    // SESSION VALUES
    // ============================================================

    /*
     * Only preserve session values for intents
     * that genuinely belong to the active grievance.
     */

    if (
        session &&
        session.service &&
        (
            intent === "CONFIRM" ||
            intent === "EDIT" ||
            intent === "DESCRIPTION" ||
            intent === "POLICY_NUMBER" ||
            intent === "STATUS" ||
            intent === "ESCALATION"
        )
    ) {

        service =
            session.service;

    }


    if (
        session &&
        session.problem &&
        (
            intent === "CONFIRM" ||
            intent === "EDIT" ||
            intent === "DESCRIPTION" ||
            intent === "POLICY_NUMBER" ||
            intent === "STATUS" ||
            intent === "ESCALATION"
        )
    ) {

        problem =
            session.problem;

    }


    // ========================================
    // REFERENCE NUMBER
    // ========================================

    let referenceNumber =
        result.referenceNumber ||
        null;


    if (
        !referenceNumber &&
        session &&
        (
            intent === "CONFIRM" ||
            intent === "EDIT" ||
            intent === "DESCRIPTION"
        )
    ) {

        referenceNumber =
            session.policyNumber ||
            session.referenceNumber ||
            null;

    }


    // ========================================
    // TICKET ID
    // ========================================

    /*
     * Do NOT automatically attach an old ticket
     * to a completely new NORMAL question.
     */

    let ticketId =
        result.ticketId ||
        null;


    if (
        !ticketId &&
        session &&
        (
            intent === "CONFIRM" ||
            intent === "EDIT" ||
            intent === "DESCRIPTION" ||
            intent === "STATUS" ||
            intent === "ESCALATION"
        )
    ) {

        ticketId =
            session.ticketId ||
            null;

    }


    // ========================================
    // CONFIDENCE
    // ========================================

    let confidence =
        Number(
            result.confidence
        );


    if (
        Number.isNaN(confidence)
    ) {

        confidence =
            0;

    }


    confidence =
        Math.max(
            0,
            Math.min(
                1,
                confidence
            )
        );


    // ========================================
    // FINAL RESULT
    // ========================================

    const finalResult = {

        intent,

        service,

        problem,

        referenceNumber,

        ticketId,

        confidence

    };


    console.log(
        "\n===== AI INTENT ====="
    );

    console.log(
        finalResult
    );

    console.log(
        "====================\n"
    );


    return finalResult;

}


// ============================================
// EXPORT
// ============================================

module.exports = {

    classifyMessage,

    detectConfirmation,

    detectEdit,

    extractReferenceNumber

};