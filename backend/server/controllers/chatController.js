const {
    askGroq
} = require("../services/groqService");


const {
    classifyMessage
} = require("../services/intentService");


const {
    setGrievanceSession,
    getGrievanceSession,
    updateGrievanceSession
} = require("../services/grievanceState");


const {
    createGrievance,
    getGrievanceByTicket,
    escalateGrievance
} = require("../services/grievanceTicketService");


const {
    detectLanguage
} = require("../services/languageService");


const {
    translateText
} = require("../services/translationService");


// ============================================================
// RESPONSE HELPER
// ============================================================

async function sendResponse(
    res,
    payload,
    language
) {

    try {

        let response =
            payload.response;


        // ========================================
        // TRANSLATE RESPONSE
        // ========================================

        if (
            response &&
            language &&
            language !== "ENGLISH"
        ) {

            response =
                await translateText(
                    response,
                    language
                );

        }


        return res.json({

            ...payload,

            response

        });

    }

    catch (error) {

        console.error(
            "Response translation error:",
            error.message
        );


        return res.json(
            payload
        );

    }

}


// ============================================================
// NORMALIZE TEXT
// ============================================================

function normalizeText(text) {

    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(/[.!?,]/g, "")
        .replace(/\s+/g, " ");

}


// ============================================================
// STRICT CONFIRMATION
// ============================================================

function isStrictConfirmation(text) {

    const value =
        normalizeText(text);


    const confirmations = [

        // ========================================
        // ENGLISH
        // ========================================

        "yes",
        "y",
        "yes correct",
        "yes thats correct",
        "yes that's correct",
        "correct",
        "thats correct",
        "that's correct",
        "all correct",
        "everything is correct",
        "information is correct",
        "that is correct",
        "confirmed",
        "confirm",
        "okay",
        "ok",
        "proceed",


        // ========================================
        // TAMIL
        // ========================================

        "ஆம்",
        "ஆமாம்",
        "சரி",
        "சரிதான்",
        "ஆம் சரி",
        "ஆமாம் சரி",
        "தகவல் சரி",
        "எல்லாம் சரி",
        "தகவல்கள் சரி",
        "சரியாக உள்ளது",
        "ஆம் சரியாக உள்ளது",
        "ஆமாம் சரியாக உள்ளது",
        "பதிவு செய்யலாம்",
        "பதிவு செய்யுங்கள்",


        // ========================================
        // HINDI
        // ========================================

        "हाँ",
        "हां",
        "हाँ सही है",
        "हां सही है",
        "सही है",
        "बिल्कुल सही",
        "जी हाँ",
        "जी हां",
        "ठीक है",
        "सही",
        "पुष्टि",


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
        "thagaval sari",
        "ellam sari",
        "correct ah iruku",
        "correct ah irukku",
        "sari ah iruku",
        "sari ah irukku"

    ];


    return confirmations.includes(
        value
    );

}


// ============================================================
// STRICT EDIT
// ============================================================

function isStrictEdit(text) {

    const value =
        normalizeText(text);


    const edits = [

        // ========================================
        // ENGLISH
        // ========================================

        "no",
        "n",
        "no change",
        "edit",
        "change",
        "change details",
        "wrong",
        "incorrect",
        "not correct",
        "details are wrong",
        "change it",


        // ========================================
        // TAMIL
        // ========================================

        "இல்லை",
        "இல்ல",
        "வேண்டாம்",
        "மாற்ற வேண்டும்",
        "மாற்றவும்",
        "தவறு",
        "தகவல் தவறு",
        "சரி இல்லை",
        "தகவல் சரி இல்லை",
        "திருத்த வேண்டும்",
        "திருத்தவும்",


        // ========================================
        // HINDI
        // ========================================

        "नहीं",
        "नही",
        "गलत है",
        "बदलना है",
        "बदलें",
        "सही नहीं है"

    ];


    return edits.includes(
        value
    );

}


// ============================================================
// DETECT NEW GRIEVANCE
// ============================================================

function looksLikeNewGrievance(
    text,
    intent
) {

    const value =
        normalizeText(text);


    // ========================================
    // AI INTENT
    // ========================================

    if (
        intent &&
        (
            intent.intent ===
            "NEW_GRIEVANCE" ||

            intent.intent ===
            "DESCRIPTION"
        )
    ) {

        return true;

    }


    // ========================================
    // ENGLISH
    // ========================================

    const grievancePatterns = [

        "complaint",
        "complain",
        "grievance",
        "not received",
        "has not received",
        "not credited",
        "rejected",
        "claim rejected",
        "payment not received",
        "money not received",
        "register a complaint",
        "file a complaint",


        // ====================================
        // TAMIL
        // ====================================

        "புகார்",
        "குறை",
        "புகார் பதிவு",
        "புகார் பதிவு செய்ய",
        "நிராகரிக்கப்பட்ட",
        "நிராகரிக்கப்பட்டுள்ளது",
        "வரவில்லை",
        "கிடைக்கவில்லை",
        "தொகை வரவில்லை",
        "பணம் வரவில்லை",
        "காப்பீட்டுத் தொகை",
        "காப்பீட்டு தொகை",
        "கோரிக்கை நிராகரிக்கப்பட்ட",
        "கடன் விண்ணப்பம் நிராகரிக்கப்பட்ட",
        "கடன் கிடைக்கவில்லை",


        // ====================================
        // HINDI
        // ====================================

        "शिकायत",
        "शिकायत दर्ज",
        "पैसे नहीं मिले",
        "राशि नहीं मिली",
        "दावा खारिज",
        "बीमा राशि नहीं मिली",
        "शिकायत करना है",
        "ऋण आवेदन अस्वीकार",
        "लोन नहीं मिला"

    ];


    for (
        const pattern of grievancePatterns
    ) {

        if (
            value.includes(pattern)
        ) {

            return true;

        }

    }


    return false;

}


// ============================================================
// SERVICE LABEL
// ============================================================

function getReferenceLabel(service) {

    switch (
    String(service || "")
        .toUpperCase()
    ) {

        case "PMFBY":

            return "PMFBY policy or application number";


        case "KCC":

            return "KCC or loan application/reference number";


        case "BANKING":

            return "bank loan application or reference number";


        case "PACS":

            return "PACS membership or application/reference number";


        default:

            return "application or relevant reference number";

    }

}


// ============================================================
// LOCAL SPOKEN NUMBER CONVERSION
// ============================================================
//
// This helps voice input such as:
//
// Hindi:
// "एक दो तीन चार पांच छह सात आठ"
//
// Tamil:
// "ஒன்று இரண்டு மூன்று நான்கு ஐந்து ஆறு ஏழு எட்டு"
//
// English:
// "one two three four five six seven eight"
//
// become:
// 12345678
//
// This is used ONLY when the application is
// waiting for a reference number.
// ============================================================

function extractSpokenNumber(text) {

    const value =
        normalizeText(text);


    // ========================================
    // DIGITS ALREADY PRESENT
    // ========================================

    const digitMatch =
        value.match(
            /\b\d{4,20}\b/
        );


    if (digitMatch) {

        return digitMatch[0];

    }


    // ========================================
    // WORD → DIGIT
    // ========================================

    const numberMap = {

        // English

        "zero": "0",
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",

        // Hindi

        "शून्य": "0",
        "एक": "1",
        "दो": "2",
        "तीन": "3",
        "चार": "4",
        "पांच": "5",
        "पाँच": "5",
        "छह": "6",
        "छः": "6",
        "सात": "7",
        "आठ": "8",
        "नौ": "9",

        // Tamil

        "பூஜ்யம்": "0",
        "சுழியம்": "0",
        "ஒன்று": "1",
        "ரெண்டு": "2",
        "இரண்டு": "2",
        "மூன்று": "3",
        "நான்கு": "4",
        "ஐந்து": "5",
        "ஆறு": "6",
        "ஏழு": "7",
        "எட்டு": "8",
        "ஒன்பது": "9"

    };


    const tokens =
        value.split(/\s+/);


    const digits = [];


    for (
        const token of tokens
    ) {

        if (
            numberMap[token] !== undefined
        ) {

            digits.push(
                numberMap[token]
            );

        }

    }


    if (
        digits.length >= 4
    ) {

        return digits.join("");

    }


    return null;

}


// ============================================================
// EXTRACT REFERENCE NUMBER
// ============================================================

function getReferenceNumber(
    message,
    intent
) {

    // ========================================
    // AI EXTRACTION FIRST
    // ========================================

    if (
        intent &&
        intent.referenceNumber
    ) {

        return String(
            intent.referenceNumber
        ).trim();

    }


    // ========================================
    // SPOKEN NUMBER
    // ========================================

    const spokenNumber =
        extractSpokenNumber(
            message
        );


    if (spokenNumber) {

        return spokenNumber;

    }


    return null;

}


// ============================================================
// STATUS RESPONSE
// ============================================================

function buildStatusResponse(
    grievance
) {

    return `Grievance Status

Ticket ID: ${grievance.ticketId}

Service: ${grievance.service}

Issue: ${grievance.problem}

Status: ${grievance.status}

Escalation Level: ${grievance.escalationLevel}

Created: ${grievance.createdAt}

Last Updated: ${grievance.updatedAt}`;

}


// ============================================================
// CREATE TICKET
// ============================================================

function registerDemoGrievance(
    session
) {

    return createGrievance({

        service:
            session.service,

        problem:
            session.problem,

        policyNumber:
            session.policyNumber,

        description:
            session.description

    });

}


// ============================================================
// CHAT CONTROLLER
// ============================================================

async function chatController(
    req,
    res
) {

    try {

        // ========================================
        // REQUEST BODY
        // ========================================

        const {

            message,

            sessionId,

            ticketId:
            clientTicketId

        } =
            req.body || {};


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !message ||
            !sessionId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "message and sessionId are required"

            });

        }


        const currentSessionId =
            String(
                sessionId
            ).trim();


        const userMessage =
            String(
                message
            ).trim();


        if (!currentSessionId) {

            return res.status(400).json({

                success: false,

                message:
                    "sessionId cannot be empty"

            });

        }


        if (!userMessage) {

            return res.status(400).json({

                success: false,

                message:
                    "message cannot be empty"

            });

        }


        // ========================================
        // LANGUAGE
        // ========================================

        const detectedLanguage =
            await detectLanguage(
                userMessage
            );


        console.log(
            "\n========================================"
        );

        console.log(
            "MESSAGE:",
            userMessage
        );

        console.log(
            "LANGUAGE:",
            detectedLanguage
        );


        // ========================================
        // EXISTING SESSION
        // ========================================

        const existingSession =
            getGrievanceSession(
                currentSessionId
            );


        console.log(
            "\n===== EXISTING SESSION ====="
        );

        console.log(
            existingSession || "NO SESSION"
        );


        // ========================================
        // CLASSIFY
        // ========================================

        const intent =
            await classifyMessage(
                userMessage,
                existingSession
            );


        console.log(
            "\n===== AI INTENT ====="
        );

        console.log(
            intent
        );


        // ========================================
        // CLIENT TICKET
        // ========================================

        const clientTicket =
            clientTicketId
                ? String(
                    clientTicketId
                ).trim()
                : null;


        // ====================================================
        // 1. NORMAL QUESTION
        // ====================================================
        //
        // THIS MUST COME BEFORE EXISTING SESSION.
        //
        // Otherwise:
        //
        // Old PMFBY session
        //        +
        // "What is KCC?"
        //
        // would enter PMFBY flow.
        //
        // ====================================================

        if (
            intent.intent ===
            "NORMAL"
        ) {

            console.log(
                "\n===== NORMAL QUESTION ====="
            );

            console.log(
                "Sending to RAG."
            );


            const answer =
                await askGroq(
                    userMessage,
                    intent.service
                );


            return sendResponse(

                res,

                {

                    success:
                        true,

                    type:
                        "normal",

                    service:
                        intent.service,

                    problem:
                        "GENERAL",

                    response:
                        answer

                },

                detectedLanguage

            );

        }


        // ====================================================
        // 2. NEW GRIEVANCE
        // ====================================================
        //
        // A NEW grievance always gets priority over an
        // unfinished old grievance.
        //
        // Example:
        //
        // Old:
        // PMFBY claim
        //
        // New:
        // "வங்கி என் கடன் விண்ணப்பத்தை நிராகரித்தது"
        //
        // → BANKING grievance
        //
        // ====================================================

        const newGrievance =
            looksLikeNewGrievance(
                userMessage,
                intent
            );


        if (
            newGrievance &&
            (
                intent.intent ===
                "NEW_GRIEVANCE" ||

                intent.intent ===
                "DESCRIPTION"
            )
        ) {

            const service =
                (
                    intent.service &&
                    intent.service !== "GENERAL"
                )
                    ? intent.service
                    : "GENERAL";


            const problem =
                (
                    intent.problem &&
                    intent.problem !== "GENERAL"
                )
                    ? intent.problem
                    : "GENERAL";


            console.log(
                "\n===== STARTING NEW GRIEVANCE ====="
            );

            console.log(
                "Service:",
                service
            );

            console.log(
                "Problem:",
                problem
            );


            setGrievanceSession(

                currentSessionId,

                {

                    service,

                    problem,

                    originalMessage:
                        userMessage,

                    description:
                        userMessage,

                    policyNumber:
                        null,

                    ticketId:
                        null,

                    status:
                        null,

                    escalationLevel:
                        null,

                    language:
                        detectedLanguage,

                    step:
                        "WAITING_FOR_POLICY_NUMBER"

                }

            );


            const referenceLabel =
                getReferenceLabel(
                    service
                );


            return sendResponse(

                res,

                {

                    success:
                        true,

                    type:
                        "grievance",

                    service,

                    problem,

                    description:
                        userMessage,

                    step:
                        "WAITING_FOR_POLICY_NUMBER",

                    response:
                        `உங்கள் ${service} புகாரை பதிவு செய்ய உதவுகிறேன்.

தயவுசெய்து உங்கள் ${referenceLabel}-ஐ வழங்கவும்.`

                },

                detectedLanguage

            );

        }


        // ====================================================
        // 3. TICKET ID
        // ====================================================

        const resolvedTicketId =
            intent.ticketId ||
            clientTicket ||
            null;


        if (
            resolvedTicketId &&
            (
                intent.intent ===
                "STATUS" ||

                intent.intent ===
                "ESCALATION" ||

                intent.intent ===
                "TICKET_ID"
            )
        ) {

            console.log(
                "\n===== TICKET LOOKUP ====="
            );

            console.log(
                "Ticket:",
                resolvedTicketId
            );


            const grievance =
                getGrievanceByTicket(
                    resolvedTicketId
                );


            if (!grievance) {

                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        step:
                            "STATUS",

                        response:
                            "I could not find a grievance with that Ticket ID. Please check the Ticket ID and try again."

                    },

                    detectedLanguage

                );

            }


            // ====================================
            // ESCALATION
            // ====================================

            if (
                intent.intent ===
                "ESCALATION"
            ) {

                if (
                    grievance.status ===
                    "ESCALATED"
                ) {

                    return sendResponse(

                        res,

                        {

                            success:
                                true,

                            type:
                                "grievance",

                            service:
                                grievance.service,

                            problem:
                                grievance.problem,

                            policyNumber:
                                grievance.policyNumber,

                            ticketId:
                                grievance.ticketId,

                            status:
                                grievance.status,

                            escalationLevel:
                                grievance.escalationLevel,

                            step:
                                "ESCALATED",

                            response:
                                `Your grievance has already been escalated.

Ticket ID: ${grievance.ticketId}

Status: ${grievance.status}

Escalation Level: ${grievance.escalationLevel}`

                        },

                        detectedLanguage

                    );

                }


                const updated =
                    escalateGrievance(
                        resolvedTicketId
                    );


                if (!updated) {

                    return sendResponse(

                        res,

                        {

                            success:
                                false,

                            type:
                                "grievance",

                            response:
                                "Unable to escalate the grievance."

                        },

                        detectedLanguage

                    );

                }


                if (
                    existingSession
                ) {

                    updateGrievanceSession(

                        currentSessionId,

                        {

                            ticketId:
                                updated.ticketId,

                            status:
                                updated.status,

                            escalationLevel:
                                updated.escalationLevel,

                            step:
                                "ESCALATED"

                        }

                    );

                }


                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        service:
                            updated.service,

                        problem:
                            updated.problem,

                        policyNumber:
                            updated.policyNumber,

                        description:
                            updated.description,

                        ticketId:
                            updated.ticketId,

                        status:
                            updated.status,

                        escalationLevel:
                            updated.escalationLevel,

                        step:
                            "ESCALATED",

                        response:
                            `Your grievance has been escalated successfully.

Ticket ID: ${updated.ticketId}

Service: ${updated.service}

Issue: ${updated.problem}

Status: ${updated.status}

Escalation Level: ${updated.escalationLevel}

Please keep your Ticket ID for future follow-up.`

                    },

                    detectedLanguage

                );

            }


            // ====================================
            // STATUS
            // ====================================

            return sendResponse(

                res,

                {

                    success:
                        true,

                    type:
                        "grievance",

                    service:
                        grievance.service,

                    problem:
                        grievance.problem,

                    policyNumber:
                        grievance.policyNumber,

                    description:
                        grievance.description,

                    ticketId:
                        grievance.ticketId,

                    status:
                        grievance.status,

                    escalationLevel:
                        grievance.escalationLevel,

                    createdAt:
                        grievance.createdAt,

                    updatedAt:
                        grievance.updatedAt,

                    step:
                        "STATUS",

                    response:
                        buildStatusResponse(
                            grievance
                        )

                },

                detectedLanguage

            );

        }


        // ====================================================
        // 4. STATUS FROM CURRENT SESSION
        // ====================================================

        if (
            intent.intent ===
            "STATUS"
        ) {

            const ticketId =
                intent.ticketId ||
                clientTicket ||
                existingSession?.ticketId;


            if (!ticketId) {

                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        step:
                            "STATUS",

                        response:
                            "இந்த அமர்வில் பதிவு செய்யப்பட்ட புகார் கிடைக்கவில்லை. தயவுசெய்து உங்கள் grievance Ticket ID-ஐ வழங்கவும்."

                    },

                    detectedLanguage

                );

            }


            const grievance =
                getGrievanceByTicket(
                    ticketId
                );


            if (!grievance) {

                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        step:
                            "STATUS",

                        response:
                            "இந்த Ticket ID-க்கு புகார் கிடைக்கவில்லை. Ticket ID-ஐ சரிபார்த்து மீண்டும் முயற்சிக்கவும்."

                    },

                    detectedLanguage

                );

            }


            return sendResponse(

                res,

                {

                    success:
                        true,

                    type:
                        "grievance",

                    service:
                        grievance.service,

                    problem:
                        grievance.problem,

                    policyNumber:
                        grievance.policyNumber,

                    description:
                        grievance.description,

                    ticketId:
                        grievance.ticketId,

                    status:
                        grievance.status,

                    escalationLevel:
                        grievance.escalationLevel,

                    step:
                        "STATUS",

                    response:
                        buildStatusResponse(
                            grievance
                        )

                },

                detectedLanguage

            );

        }


        // ====================================================
        // 5. ESCALATION WITHOUT TICKET
        // ====================================================

        if (
            intent.intent ===
            "ESCALATION"
        ) {

            const ticketId =
                intent.ticketId ||
                clientTicket ||
                existingSession?.ticketId;


            if (!ticketId) {

                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        step:
                            "ESCALATION",

                        response:
                            "Please provide your grievance Ticket ID so I can escalate your complaint."

                    },

                    detectedLanguage

                );

            }

        }


        // ====================================================
        // 6. EXISTING GRIEVANCE SESSION
        // ====================================================

        if (
            existingSession
        ) {

            // ==================================================
            // WAITING FOR POLICY / REFERENCE NUMBER
            // ==================================================

            if (
                existingSession.step ===
                "WAITING_FOR_POLICY_NUMBER"
            ) {

                const referenceNumber =
                    getReferenceNumber(
                        userMessage,
                        intent
                    );


                if (!referenceNumber) {

                    const referenceLabel =
                        getReferenceLabel(
                            existingSession.service
                        );


                    return sendResponse(

                        res,

                        {

                            success:
                                true,

                            type:
                                "grievance",

                            service:
                                existingSession.service,

                            problem:
                                existingSession.problem,

                            step:
                                "WAITING_FOR_POLICY_NUMBER",

                            response:
                                `தயவுசெய்து உங்கள் ${referenceLabel}-ஐ வழங்கவும்.`

                        },

                        detectedLanguage

                    );

                }


                // ============================================
                // SAVE REFERENCE NUMBER
                // ============================================

                const originalDescription =
                    existingSession.originalMessage ||
                    existingSession.description ||
                    "";


                updateGrievanceSession(

                    currentSessionId,

                    {

                        policyNumber:
                            referenceNumber,

                        description:
                            originalDescription,

                        step:
                            "WAITING_FOR_CONFIRMATION",

                        language:
                            detectedLanguage

                    }

                );


                // ============================================
                // SUMMARY
                // ============================================

                const summary =

                    `Grievance Summary

Service: ${existingSession.service}

Issue: ${existingSession.problem}

Policy/Application/Reference Number: ${referenceNumber}

Description:
${originalDescription}

இந்த தகவல் சரியானதா?

YES / ஆம் / ஆமாம் என்று பதிலளிக்கவும்.
திருத்த வேண்டுமெனில் NO / இல்லை என்று பதிலளிக்கவும்.`;


                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        service:
                            existingSession.service,

                        problem:
                            existingSession.problem,

                        policyNumber:
                            referenceNumber,

                        description:
                            originalDescription,

                        step:
                            "WAITING_FOR_CONFIRMATION",

                        response:
                            summary

                    },

                    detectedLanguage

                );

            }


            // ==================================================
            // WAITING FOR CONFIRMATION
            // ==================================================

            if (
                existingSession.step ===
                "WAITING_FOR_CONFIRMATION"
            ) {

                // ============================================
                // CONFIRM
                // ============================================

                if (
                    (
                        intent.intent ===
                        "CONFIRM"
                    ) &&
                    isStrictConfirmation(
                        userMessage
                    )
                ) {

                    console.log(
                        "\n===== GRIEVANCE CONFIRMED ====="
                    );


                    // ========================================
                    // CREATE DEMO TICKET
                    // ========================================

                    const grievance =
                        registerDemoGrievance(
                            existingSession
                        );


                    updateGrievanceSession(

                        currentSessionId,

                        {

                            ticketId:
                                grievance.ticketId,

                            status:
                                grievance.status,

                            escalationLevel:
                                grievance.escalationLevel,

                            createdAt:
                                grievance.createdAt,

                            updatedAt:
                                grievance.updatedAt,

                            step:
                                "REGISTERED"

                        }

                    );


                    return sendResponse(

                        res,

                        {

                            success:
                                true,

                            type:
                                "grievance",

                            service:
                                grievance.service,

                            problem:
                                grievance.problem,

                            policyNumber:
                                grievance.policyNumber,

                            description:
                                grievance.description,

                            ticketId:
                                grievance.ticketId,

                            status:
                                grievance.status,

                            escalationLevel:
                                grievance.escalationLevel,

                            step:
                                "REGISTERED",

                            response:
                                `புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது.

Ticket ID: ${grievance.ticketId}

சேவை: ${grievance.service}

சிக்கல்: ${grievance.problem}

நிலை: ${grievance.status}

இது Coop Sahayak prototype-ல் உருவாக்கப்பட்ட demo ticket மட்டுமே. இது உண்மையான அரசு புகார் எண் அல்ல.

இந்த Ticket ID-ஐ பயன்படுத்தி புகார் நிலை மற்றும் escalation-ஐ சோதிக்கலாம்.`

                        },

                        detectedLanguage

                    );

                }


                // ============================================
                // EDIT
                // ============================================

                if (
                    (
                        intent.intent ===
                        "EDIT"
                    ) ||
                    isStrictEdit(
                        userMessage
                    )
                ) {

                    updateGrievanceSession(

                        currentSessionId,

                        {

                            step:
                                "WAITING_FOR_DESCRIPTION"

                        }

                    );


                    return sendResponse(

                        res,

                        {

                            success:
                                true,

                            type:
                                "grievance",

                            step:
                                "EDIT",

                            response:
                                "சரி. தயவுசெய்து உங்கள் புகாரின் சரியான விவரத்தை மீண்டும் வழங்கவும்."

                        },

                        detectedLanguage

                    );

                }


                // ============================================
                // IF USER STARTS A DIFFERENT GRIEVANCE
                // ============================================

                if (
                    newGrievance
                ) {

                    const service =
                        (
                            intent.service &&
                            intent.service !== "GENERAL"
                        )
                            ? intent.service
                            : "GENERAL";


                    const problem =
                        (
                            intent.problem &&
                            intent.problem !== "GENERAL"
                        )
                            ? intent.problem
                            : "GENERAL";


                    setGrievanceSession(

                        currentSessionId,

                        {

                            service,

                            problem,

                            originalMessage:
                                userMessage,

                            description:
                                userMessage,

                            policyNumber:
                                null,

                            ticketId:
                                null,

                            status:
                                null,

                            escalationLevel:
                                null,

                            language:
                                detectedLanguage,

                            step:
                                "WAITING_FOR_POLICY_NUMBER"

                        }

                    );


                    const referenceLabel =
                        getReferenceLabel(
                            service
                        );


                    return sendResponse(

                        res,

                        {

                            success:
                                true,

                            type:
                                "grievance",

                            service,

                            problem,

                            step:
                                "WAITING_FOR_POLICY_NUMBER",

                            response:
                                `புதிய ${service} புகாரை பதிவு செய்ய உதவுகிறேன்.

தயவுசெய்து உங்கள் ${referenceLabel}-ஐ வழங்கவும்.`

                        },

                        detectedLanguage

                    );

                }


                // ============================================
                // UNKNOWN CONFIRMATION
                // ============================================

                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        service:
                            existingSession.service,

                        problem:
                            existingSession.problem,

                        policyNumber:
                            existingSession.policyNumber,

                        description:
                            existingSession.description,

                        step:
                            "WAITING_FOR_CONFIRMATION",

                        response:
                            "தயவுசெய்து புகார் தகவல் சரியானதா என்பதை உறுதிப்படுத்தவும். YES / ஆம் என்று உறுதிப்படுத்தவும் அல்லது NO / இல்லை என்று திருத்தவும்."

                    },

                    detectedLanguage

                );

            }


            // ==================================================
            // WAITING FOR DESCRIPTION
            // ==================================================

            if (
                existingSession.step ===
                "WAITING_FOR_DESCRIPTION"
            ) {

                const problem =
                    (
                        intent.problem &&
                        intent.problem !== "GENERAL"
                    )
                        ? intent.problem
                        : existingSession.problem;


                updateGrievanceSession(

                    currentSessionId,

                    {

                        description:
                            userMessage,

                        problem,

                        step:
                            "WAITING_FOR_CONFIRMATION"

                    }

                );


                const summary =

                    `Grievance Summary

Service: ${existingSession.service}

Issue: ${problem}

Policy/Application/Reference Number: ${existingSession.policyNumber}

Description:
${userMessage}

இந்த தகவல் சரியானதா?

YES / ஆம் / ஆமாம் என்று பதிலளிக்கவும்.
திருத்த வேண்டுமெனில் NO / இல்லை என்று பதிலளிக்கவும்.`;


                return sendResponse(

                    res,

                    {

                        success:
                            true,

                        type:
                            "grievance",

                        service:
                            existingSession.service,

                        problem,

                        policyNumber:
                            existingSession.policyNumber,

                        description:
                            userMessage,

                        step:
                            "WAITING_FOR_CONFIRMATION",

                        response:
                            summary

                    },

                    detectedLanguage

                );

            }


            // ==================================================
            // REGISTERED / ESCALATED
            // ==================================================
            //
            // IMPORTANT:
            //
            // We DO NOT automatically return STATUS here.
            //
            // The user may ask a completely unrelated
            // question after creating a grievance.
            //
            // STATUS is handled explicitly above.
            //
            // ==================================================

            if (
                existingSession.step ===
                "REGISTERED" ||

                existingSession.step ===
                "ESCALATED"
            ) {

                console.log(
                    "Registered session exists, but no status intent."
                );

                /*
                 * Do NOT hijack the message.
                 *
                 * Continue to RAG below.
                 */

            }

        }


        // ====================================================
        // 7. POLICY NUMBER WITHOUT SESSION
        // ====================================================

        if (
            intent.intent ===
            "POLICY_NUMBER"
        ) {

            return sendResponse(

                res,

                {

                    success:
                        true,

                    type:
                        "normal",

                    response:
                        "இந்த எண்ணுடன் தொடர்புடைய செயலில் உள்ள புகார் session கிடைக்கவில்லை. முதலில் உங்கள் புகார் அல்லது பிரச்சினையைச் சொல்லுங்கள்."

                },

                detectedLanguage

            );

        }


        // ====================================================
        // 8. DESCRIPTION WITHOUT SESSION
        // ====================================================

        if (
            intent.intent ===
            "DESCRIPTION"
        ) {

            /*
             * If the AI says DESCRIPTION but there is
             * no active grievance, treat it as a normal
             * user message instead of forcing PMFBY.
             */

            const answer =
                await askGroq(
                    userMessage,
                    intent.service
                );


            return sendResponse(

                res,

                {

                    success:
                        true,

                    type:
                        "normal",

                    service:
                        intent.service,

                    problem:
                        intent.problem,

                    response:
                        answer

                },

                detectedLanguage

            );

        }


        // ====================================================
        // 9. FINAL FALLBACK → RAG
        // ====================================================

        console.log(
            "\n===== FINAL RAG FALLBACK ====="
        );


        const answer =
            await askGroq(
                userMessage,
                intent.service
            );


        return sendResponse(

            res,

            {

                success:
                    true,

                type:
                    "normal",

                service:
                    intent.service,

                problem:
                    intent.problem,

                response:
                    answer

            },

            detectedLanguage

        );

    }


    catch (error) {

        console.error(
            "\n===== CHAT CONTROLLER ERROR ====="
        );

        console.error(
            error
        );

        console.error(
            "================================\n"
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Something went wrong while processing your request."

        });

    }

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    chatController

};