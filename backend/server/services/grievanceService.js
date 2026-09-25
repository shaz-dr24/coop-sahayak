const {
    classifyMessage
} = require("./intentService");


// ============================================
// UNDERSTAND GRIEVANCE
// ============================================

async function understandGrievance(
    message,
    session = null
) {

    return await classifyMessage(
        message,
        session
    );
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    understandGrievance

};