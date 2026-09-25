const fs = require("fs");
const path = require("path");


// ============================================
// GRIEVANCE SESSION FILE
// ============================================

const sessionFilePath = path.join(
    __dirname,
    "../../data/grievanceSessions.json"
);


// ============================================
// ENSURE FILE EXISTS
// ============================================

function ensureSessionFile() {

    const directory =
        path.dirname(sessionFilePath);

    if (!fs.existsSync(directory)) {

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );
    }


    if (!fs.existsSync(sessionFilePath)) {

        fs.writeFileSync(
            sessionFilePath,
            "{}",
            "utf-8"
        );
    }
}


// ============================================
// LOAD SESSIONS
// ============================================

function loadSessions() {

    ensureSessionFile();

    try {

        const data =
            fs.readFileSync(
                sessionFilePath,
                "utf-8"
            );


        if (!data.trim()) {

            return {};
        }


        const sessions =
            JSON.parse(data);


        if (
            typeof sessions !== "object" ||
            Array.isArray(sessions)
        ) {

            return {};
        }


        return sessions;

    }

    catch (error) {

        console.error(
            "Error reading grievanceSessions.json:",
            error
        );

        return {};
    }
}


// ============================================
// SAVE SESSIONS
// ============================================

function saveSessions(sessions) {

    ensureSessionFile();

    fs.writeFileSync(

        sessionFilePath,

        JSON.stringify(
            sessions,
            null,
            2
        ),

        "utf-8"

    );
}


// ============================================
// CREATE / SET SESSION
// ============================================

function setGrievanceSession(
    sessionId,
    data
) {

    if (!sessionId) {

        return;
    }


    const sessions =
        loadSessions();


    sessions[sessionId] = {

        ...data

    };


    saveSessions(
        sessions
    );
}


// ============================================
// GET SESSION
// ============================================

function getGrievanceSession(
    sessionId
) {

    if (!sessionId) {

        return null;
    }


    const sessions =
        loadSessions();


    return (
        sessions[sessionId] ||
        null
    );
}


// ============================================
// UPDATE SESSION
// ============================================

function updateGrievanceSession(
    sessionId,
    data
) {

    if (!sessionId) {

        return;
    }


    const sessions =
        loadSessions();


    const existing =
        sessions[sessionId] ||
        {};


    sessions[sessionId] = {

        ...existing,

        ...data

    };


    saveSessions(
        sessions
    );
}


// ============================================
// DELETE SESSION
// ============================================

function clearGrievanceSession(
    sessionId
) {

    if (!sessionId) {

        return;
    }


    const sessions =
        loadSessions();


    delete sessions[sessionId];


    saveSessions(
        sessions
    );
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    setGrievanceSession,

    getGrievanceSession,

    updateGrievanceSession,

    clearGrievanceSession

};