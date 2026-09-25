const {
    askGroq
} = require("../services/groqService");


// ============================================
// SCHEME CONTROLLER
// ============================================

async function schemeController(req, res) {

    try {

        const message =
            String(
                req.body.message || ""
            ).trim();


        // ========================================
        // VALIDATE MESSAGE
        // ========================================

        if (!message) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide your question."

            });
        }


        // ========================================
        // ASK GROQ
        // ========================================

        const answer =
            await askGroq(message);


        // ========================================
        // RETURN RESPONSE
        // ========================================

        return res.json({

            success: true,

            type: "scheme",

            response:
                answer

        });

    }

    catch (error) {

        console.error(
            "Scheme controller error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to process your scheme request."

        });

    }

}


// ============================================
// EXPORT
// ============================================

module.exports = {

    schemeController

};