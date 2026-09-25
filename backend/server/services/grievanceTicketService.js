const fs = require("fs");
const path = require("path");


// ============================================
// GRIEVANCE FILE
// ============================================

const grievanceFilePath = path.join(
    __dirname,
    "../../data/grievances.json"
);


// ============================================
// ENSURE FILE EXISTS
// ============================================

function ensureGrievanceFile() {

    const directory =
        path.dirname(grievanceFilePath);

    if (!fs.existsSync(directory)) {

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );
    }


    if (!fs.existsSync(grievanceFilePath)) {

        fs.writeFileSync(
            grievanceFilePath,
            "[]",
            "utf-8"
        );
    }
}


// ============================================
// LOAD GRIEVANCES
// ============================================

function loadGrievances() {

    ensureGrievanceFile();

    try {

        const data =
            JSON.parse(
                fs.readFileSync(
                    grievanceFilePath,
                    "utf-8"
                )
            );


        if (!Array.isArray(data)) {

            return [];
        }


        return data;

    }

    catch (error) {

        console.error(
            "Error reading grievances.json:",
            error
        );

        return [];
    }
}


// ============================================
// SAVE GRIEVANCES
// ============================================

function saveGrievances(grievances) {

    ensureGrievanceFile();

    fs.writeFileSync(

        grievanceFilePath,

        JSON.stringify(
            grievances,
            null,
            2
        ),

        "utf-8"

    );
}


// ============================================
// GENERATE TICKET ID
// ============================================

function generateTicketId(service) {

    const prefix =
        service || "GENERAL";


    const timestamp =
        Date.now()
            .toString()
            .slice(-8);


    return `GRV-${prefix}-${timestamp}`;
}


// ============================================
// CREATE GRIEVANCE
// ============================================

function createGrievance(data) {

    const grievances =
        loadGrievances();


    const ticketId =
        generateTicketId(
            data.service
        );


    const grievance = {

        ticketId,

        service:
            data.service || "GENERAL",

        problem:
            data.problem || "GENERAL",

        policyNumber:
            data.policyNumber || null,

        description:
            data.description || "",

        status:
            "REGISTERED",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        escalationLevel:
            0

    };


    grievances.push(
        grievance
    );


    saveGrievances(
        grievances
    );


    return grievance;
}


// ============================================
// GET GRIEVANCE BY TICKET
// ============================================

function getGrievanceByTicket(
    ticketId
) {

    const grievances =
        loadGrievances();


    return grievances.find(
        grievance =>
            grievance.ticketId ===
            ticketId
    ) || null;
}


// ============================================
// UPDATE STATUS
// ============================================

function updateGrievanceStatus(
    ticketId,
    status
) {

    const grievances =
        loadGrievances();


    const index =
        grievances.findIndex(
            grievance =>
                grievance.ticketId ===
                ticketId
        );


    if (index === -1) {

        return null;
    }


    grievances[index].status =
        status;


    grievances[index].updatedAt =
        new Date().toISOString();


    saveGrievances(
        grievances
    );


    return grievances[index];
}


// ============================================
// ESCALATE GRIEVANCE
// ============================================

function escalateGrievance(
    ticketId
) {

    const grievances =
        loadGrievances();


    const index =
        grievances.findIndex(
            grievance =>
                grievance.ticketId ===
                ticketId
        );


    if (index === -1) {

        return null;
    }


    grievances[index]
        .escalationLevel =
        (grievances[index]
            .escalationLevel || 0) + 1;


    grievances[index]
        .status =
        "ESCALATED";


    grievances[index]
        .updatedAt =
        new Date().toISOString();


    saveGrievances(
        grievances
    );


    return grievances[index];
}


// ============================================
// GET ALL GRIEVANCES
// ============================================

function getAllGrievances() {

    return loadGrievances();
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    createGrievance,

    getGrievanceByTicket,

    updateGrievanceStatus,

    escalateGrievance,

    getAllGrievances

};