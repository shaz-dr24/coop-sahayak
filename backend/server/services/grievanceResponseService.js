const Groq = require("groq-sdk");

const {
    searchKnowledge
} = require("./ragService");


// ============================================
// GROQ CLIENT
// ============================================

const groq = new Groq({

    apiKey:
        process.env.GROQ_API_KEY

});


// ============================================
// BUILD GRIEVANCE QUERY
// ============================================

function buildGrievanceQuery(
    service,
    problem,
    description
) {

    return `
${service} grievance ${problem}
${description}

Find the official grievance redressal procedure.

Focus on:
- grievance registration
- complaint filing
- where to submit
- whom to contact
- required information
- Ticket ID
- resolution timeline
- grievance redressal authority
- escalation
- appeal
`;
}


// ============================================
// GET GRIEVANCE PROCEDURE
// ============================================

async function getGrievanceProcedure(
    grievance
) {

    const {
        service,
        problem,
        description
    } = grievance;


    // ========================================
    // SEARCH QUERY
    // ========================================

    const query =
        buildGrievanceQuery(
            service,
            problem,
            description
        );


    console.log(
        "\n===== GRIEVANCE PROCEDURE SEARCH ====="
    );

    console.log(
        "Service:",
        service
    );

    console.log(
        "Problem:",
        problem
    );


    // ========================================
    // SEARCH KNOWLEDGE BASE
    // ========================================

    const results =
        await searchKnowledge(
            query
        );


    // ========================================
    // CHECK RESULTS
    // ========================================

    if (
        !results ||
        results.length === 0
    ) {

        return {

            success: false,

            message:
                "No relevant grievance procedure " +
                "was found in the provided documents."

        };
    }


    // ========================================
    // BUILD CONTEXT
    // ========================================

    const context =
        results
            .map(
                (result, index) => {

                    return `
SOURCE ${index + 1}

Document:
${result.source}

Page:
${result.page ?? "N/A"}

Content:
${result.text}
`;
                }
            )
            .join(
                "\n-------------------\n"
            );


    // ========================================
    // ASK GROQ
    // ========================================

    const response =
        await groq.chat.completions.create({

            model:
                "openai/gpt-oss-120b",

            temperature: 0.1,

            messages: [

                {
                    role: "system",

                    content: `
You are Coop Sahayak AI.

You are helping a farmer with a
government grievance.

Your job is to explain the correct
grievance redressal procedure using
ONLY the provided CONTEXT.

IMPORTANT RULES:

1. Do not invent any government
   procedure.

2. Do not invent phone numbers,
   websites, authorities, deadlines,
   ticket numbers or escalation levels.

3. If the CONTEXT contains a specific
   number, date, authority or timeline,
   use it accurately.

4. If the CONTEXT does not contain
   something, do not guess it.

5. Keep the response simple and
   farmer-friendly.

6. Answer in the same language/style
   as the user's description.

7. Focus only on the grievance.

8. Explain what the farmer should do
   next.

9. Mention the source document/page
   when useful.

GRIEVANCE:

Service:
${service}

Problem:
${problem}

Description:
${description}


CONTEXT:

${context}
`
                },

                {
                    role: "user",

                    content: `
Explain the next grievance redressal
step for my problem.

Service:
${service}

Problem:
${problem}

Description:
${description}
`
                }

            ]

        });


    // ========================================
    // EXTRACT RESPONSE
    // ========================================

    const answer =
        response
            .choices[0]
            .message
            .content;


    // ========================================
    // RETURN
    // ========================================

    return {

        success: true,

        service,

        problem,

        description,

        response:
            answer,

        sources:
            results.map(
                result => ({

                    source:
                        result.source,

                    page:
                        result.page

                })
            )

    };
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    buildGrievanceQuery,

    getGrievanceProcedure

};