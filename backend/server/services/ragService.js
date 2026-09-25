const fs = require("fs");
const path = require("path");

const {
    createEmbedding
} = require("./embeddingService");

const {
    searchSimilar
} = require("./vectorStore");


const vectorStorePath = path.join(
    __dirname,
    "../../data/vector-store.json"
);


// ============================================
// DETECT TOPIC
// ============================================

function detectTopic(query) {

    const q =
        String(query || "")
            .toLowerCase()
            .trim();


    // ========================================
    // PMFBY
    // ========================================

    if (

        q.includes("pmfby") ||

        q.includes("crop insurance") ||

        q.includes("crop insurance scheme") ||

        q.includes("crop premium") ||

        q.includes("farmer premium") ||

        q.includes("krishi rakshak") ||

        q.includes("crop claim") ||

        q.includes("claim") ||

        q.includes("insurance") ||

        q.includes("insurance amount") ||

        q.includes("insurance payment") ||

        q.includes("crop loss") ||

        q.includes("sum insured") ||

        q.includes("actuarial premium") ||

        // Tamil

        q.includes("காப்பீடு") ||

        q.includes("காப்பீட்டுத்") ||

        q.includes("காப்பீட்டு") ||

        q.includes("கோரிக்கை") ||

        q.includes("தொகை") ||

        q.includes("வரவில்லை") ||

        q.includes("நிராகரிக்கப்பட்டது") ||

        // Hindi

        q.includes("बीमा") ||

        q.includes("फसल बीमा") ||

        q.includes("बीमा राशि") ||

        q.includes("क्लेम")

    ) {

        return "pmfby";

    }


    // ========================================
    // GRIEVANCE
    // ========================================

    if (

        q.includes("grievance") ||

        q.includes("grievances") ||

        q.includes("complaint") ||

        q.includes("complain") ||

        q.includes("grievance redress") ||

        q.includes("grievance redressal") ||

        q.includes("public grievance") ||

        q.includes("file a grievance") ||

        q.includes("register a grievance") ||

        q.includes("redressal") ||

        q.includes("redress mechanism") ||

        q.includes("grievance procedure") ||

        q.includes("புகார்") ||

        q.includes("குறை") ||

        q.includes("முறையீடு") ||

        q.includes("शिकायत")

    ) {

        return "grievance";

    }


    // ========================================
    // FINANCE / KCC
    // ========================================

    if (

        q.includes("kcc") ||

        q.includes("kisan credit card") ||

        q.includes("crop loan") ||

        q.includes("agricultural loan") ||

        q.includes("farm loan") ||

        q.includes("banking") ||

        q.includes("bank account") ||

        q.includes("loan") ||

        q.includes("interest rate") ||

        q.includes("credit") ||

        // Tamil

        q.includes("கிசான் கிரெடிட்") ||

        q.includes("கிரெடிட் கார்டு") ||

        q.includes("கடன்") ||

        q.includes("வங்கி") ||

        // Hindi

        q.includes("किसान क्रेडिट") ||

        q.includes("क्रेडिट कार्ड") ||

        q.includes("ऋण") ||

        q.includes("बैंक")

    ) {

        return "finance";

    }


    // ========================================
    // PACS
    // ========================================

    if (

        q.includes("pacs") ||

        q.includes("primary agricultural credit society") ||

        q.includes("bylaws") ||

        q.includes("bye laws") ||

        q.includes("bye-laws") ||

        q.includes("model bylaws") ||

        q.includes("model byelaws") ||

        q.includes("board of directors") ||

        q.includes("director") ||

        q.includes("directors") ||

        q.includes("membership") ||

        q.includes("member of pacs") ||

        q.includes("பாக்ஸ்") ||

        q.includes("உறுப்பினர்") ||

        q.includes("सदस्यता")

    ) {

        return "pacs";

    }


    // ========================================
    // GENERAL
    // ========================================

    return null;

}


// ============================================
// DETECT QUERY TYPE
// ============================================

function detectQueryType(query) {

    const q =
        String(query || "")
            .toLowerCase()
            .trim();


    // ========================================
    // CLAIM PAYMENT NOT RECEIVED
    // ========================================

    if (

        q.includes("payment not received") ||

        q.includes("payment hasn't arrived") ||

        q.includes("payment has not arrived") ||

        q.includes("money not received") ||

        q.includes("amount not received") ||

        q.includes("insurance payment") ||

        q.includes("insurance amount not received") ||

        q.includes("claim amount not received") ||

        q.includes("claim payment") ||

        // Tamil

        q.includes("தொகை வரவில்லை") ||

        q.includes("தொகை இன்னும் வரவில்லை") ||

        q.includes("காப்பீட்டுத் தொகை வரவில்லை") ||

        q.includes("காப்பீட்டு தொகை வரவில்லை") ||

        q.includes("பணம் வரவில்லை") ||

        q.includes("பணம் இன்னும் வரவில்லை") ||

        q.includes("எனக்கு மட்டும் வரவில்லை") ||

        q.includes("எனக்கு இன்னும் வரவில்லை") ||

        // Hindi

        q.includes("राशि नहीं मिली") ||

        q.includes("पैसा नहीं मिला") ||

        q.includes("बीमा राशि नहीं मिली") ||

        q.includes("क्लेम का पैसा नहीं मिला")

    ) {

        return "CLAIM_PAYMENT_NOT_RECEIVED";

    }


    // ========================================
    // CLAIM REJECTED
    // ========================================

    if (

        q.includes("claim rejected") ||

        q.includes("claim was rejected") ||

        q.includes("insurance claim rejected") ||

        q.includes("claim refused") ||

        q.includes("claim denied") ||

        // Tamil

        q.includes("கோரிக்கை நிராகரிக்கப்பட்டது") ||

        q.includes("காப்பீட்டு கோரிக்கை நிராகரிக்கப்பட்டது") ||

        q.includes("காப்பீடு நிராகரிக்கப்பட்டது") ||

        q.includes("கோரிக்கை மறுக்கப்பட்டது") ||

        // Hindi

        q.includes("क्लेम रिजेक्ट") ||

        q.includes("क्लेम अस्वीकार") ||

        q.includes("बीमा दावा खारिज")

    ) {

        return "CLAIM_REJECTED";

    }


    // ========================================
    // PREMIUM
    // ========================================

    if (

        q.includes("premium") ||

        q.includes("premium amount") ||

        q.includes("premium rate") ||

        q.includes("பிரீமியம்") ||

        q.includes("காப்பீட்டு கட்டணம்") ||

        q.includes("प्रीमियम")

    ) {

        return "PREMIUM";

    }


    // ========================================
    // ELIGIBILITY
    // ========================================

    if (

        q.includes("eligible") ||

        q.includes("eligibility") ||

        q.includes("who can") ||

        q.includes("தகுதியானவர்கள்") ||

        q.includes("யாரெல்லாம்") ||

        q.includes("தகுதி") ||

        q.includes("पात्र") ||

        q.includes("पात्रता")

    ) {

        return "ELIGIBILITY";

    }


    // ========================================
    // GENERAL
    // ========================================

    return "GENERAL";

}


// ============================================
// FILTER DOCUMENTS BY TOPIC
// ============================================

function filterByTopic(
    documents,
    topic
) {

    if (!topic) {

        console.log(
            "No specific topic detected."
        );

        return documents;

    }


    console.log(
        `Filtering documents for topic: ${topic}`
    );


    const filtered =
        documents.filter(document => {

            const source =
                String(
                    document.source || ""
                ).toLowerCase();


            return source.startsWith(
                topic + "/"
            );

        });


    console.log(
        `Topic documents found: ${filtered.length}`
    );


    // ========================================
    // FALLBACK
    // ========================================

    if (
        filtered.length === 0
    ) {

        console.log(
            `No documents found in ${topic}/`
        );

        console.log(
            "Falling back to all documents."
        );


        return documents;

    }


    return filtered;

}


// ============================================
// KEYWORD BOOST
// ============================================

function calculateKeywordBoost(
    text,
    query,
    queryType
) {

    const documentText =
        String(text || "")
            .toLowerCase();


    const q =
        String(query || "")
            .toLowerCase();


    let boost = 0;


    // ========================================
    // CLAIM PAYMENT
    // ========================================

    if (
        queryType ===
        "CLAIM_PAYMENT_NOT_RECEIVED"
    ) {

        const keywords = [

            "claim",
            "payment",
            "paid",
            "payment released",
            "settlement",
            "settled",
            "indemnity",
            "amount",
            "not received",
            "pending",

            // PMFBY terminology

            "claim settlement",
            "claim payment",
            "insurance company",
            "insurance companies",
            "payment of claims",
            "claim status",

            // Tamil

            "கோரிக்கை",
            "தொகை",
            "காப்பீடு",
            "செலுத்த",
            "பெற",
            "நிலுவை",

            // Hindi

            "क्लेम",
            "भुगतान",
            "राशि",
            "दावा",
            "लंबित"

        ];


        for (
            const keyword of keywords
        ) {

            if (
                documentText.includes(
                    keyword
                )
            ) {

                boost += 0.08;

            }

        }


        // ====================================
        // NEGATIVE / IRRELEVANT TOPICS
        // ====================================

        const irrelevantKeywords = [

            "opt-out",
            "opt out",
            "consent declaration",
            "wild animal",
            "add-on coverage",
            "add on coverage",
            "premium subsidy",
            "actuarial premium",
            "crop cutting experiment"

        ];


        for (
            const keyword of irrelevantKeywords
        ) {

            if (
                documentText.includes(
                    keyword
                )
            ) {

                boost -= 0.12;

            }

        }

    }


    // ========================================
    // CLAIM REJECTED
    // ========================================

    if (
        queryType ===
        "CLAIM_REJECTED"
    ) {

        const keywords = [

            "claim rejected",
            "claim rejection",
            "claim denied",
            "claim repudiated",
            "rejected claim",
            "grievance",
            "complaint",
            "redressal",
            "appeal",
            "claim settlement",

            // Tamil

            "நிராகரிக்கப்பட்டது",
            "மறுக்கப்பட்டது",
            "புகார்",
            "முறையீடு",

            // Hindi

            "अस्वीकार",
            "खारिज",
            "शिकायत",
            "अपील"

        ];


        for (
            const keyword of keywords
        ) {

            if (
                documentText.includes(
                    keyword
                )
            ) {

                boost += 0.10;

            }

        }

    }


    // ========================================
    // PREMIUM
    // ========================================

    if (
        queryType ===
        "PREMIUM"
    ) {

        const keywords = [

            "premium",
            "premium rate",
            "premium amount",
            "actuarial premium",
            "farmer premium",
            "प्रीमियम",
            "பிரீமியம்"

        ];


        for (
            const keyword of keywords
        ) {

            if (
                documentText.includes(
                    keyword
                )
            ) {

                boost += 0.08;

            }

        }

    }


    // ========================================
    // ELIGIBILITY
    // ========================================

    if (
        queryType ===
        "ELIGIBILITY"
    ) {

        const keywords = [

            "eligible",
            "eligibility",
            "farmers eligible",
            "eligible farmers",
            "loanee farmers",
            "non-loanee",
            "eligibility criteria",
            "पात्र",
            "पात्रता",
            "தகுதி",
            "தகுதியான"

        ];


        for (
            const keyword of keywords
        ) {

            if (
                documentText.includes(
                    keyword
                )
            ) {

                boost += 0.08;

            }

        }

    }


    // ========================================
    // EXACT QUERY WORDS
    // ========================================

    const queryWords =
        q
            .split(/\s+/)
            .filter(
                word =>
                    word.length >= 4
            );


    for (
        const word of queryWords
    ) {

        if (
            documentText.includes(word)
        ) {

            boost += 0.015;

        }

    }


    return boost;

}


// ============================================
// RANK RESULTS
// ============================================

function rankResults(
    results,
    query,
    queryType
) {

    if (
        !Array.isArray(results)
    ) {

        return [];

    }


    const ranked =
        results.map(
            result => {

                const boost =
                    calculateKeywordBoost(
                        result.text,
                        query,
                        queryType
                    );


                const originalScore =
                    Number(
                        result.score || 0
                    );


                return {

                    ...result,

                    originalScore,

                    relevanceBoost:
                        boost,

                    score:
                        originalScore +
                        boost

                };

            }
        );


    ranked.sort(
        (a, b) =>
            b.score - a.score
    );


    return ranked;

}


// ============================================
// REMOVE NEAR DUPLICATES
// ============================================

function removeDuplicateSources(
    results
) {

    const seen =
        new Set();


    const output =
        [];


    for (
        const result of results
    ) {

        const key =
            `${result.source}_${result.page}_${result.chunkIndex}`;


        if (
            seen.has(key)
        ) {

            continue;

        }


        seen.add(key);

        output.push(result);

    }


    return output;

}


// ============================================
// SEARCH KNOWLEDGE
// ============================================

async function searchKnowledge(
    query,
    service = null
) {

    // ========================================
    // CHECK VECTOR STORE
    // ========================================

    if (
        !fs.existsSync(
            vectorStorePath
        )
    ) {

        throw new Error(
            "Vector store not found. Run: node server/ingest.js"
        );

    }


    // ========================================
    // VALIDATE QUERY
    // ========================================

    if (
        !query ||
        !String(query).trim()
    ) {

        return [];

    }


    // ========================================
    // CREATE QUERY EMBEDDING
    // ========================================

    const queryEmbedding =
        await createEmbedding(
            query,
            "query"
        );


    // ========================================
    // LOAD VECTOR STORE
    // ========================================

    const documents =
        JSON.parse(
            fs.readFileSync(
                vectorStorePath,
                "utf-8"
            )
        );


    // ========================================
    // VALIDATE
    // ========================================

    if (
        !Array.isArray(documents)
    ) {

        throw new Error(
            "vector-store.json must contain an array"
        );

    }


    console.log(
        "\nDocuments loaded:",
        documents.length
    );


    // ========================================
    // DETECT TOPIC
    // ========================================

    let topic =
        detectTopic(query);


    // ========================================
    // SERVICE FALLBACK
    // ========================================

    if (
        !topic &&
        service
    ) {

        const serviceMap = {

            KCC:
                "finance",

            BANKING:
                "finance",

            PMFBY:
                "pmfby",

            PACS:
                "pacs"

        };


        topic =
            serviceMap[
            String(service)
                .trim()
                .toUpperCase()
            ] || null;

    }


    console.log(
        "Detected topic:",
        topic || "general"
    );


    // ========================================
    // QUERY TYPE
    // ========================================

    const queryType =
        detectQueryType(
            query
        );


    console.log(
        "Detected query type:",
        queryType
    );


    // ========================================
    // FILTER DOCUMENTS
    // ========================================

    const candidateDocuments =
        filterByTopic(
            documents,
            topic
        );


    console.log(
        "Documents used for search:",
        candidateDocuments.length
    );


    // ========================================
    // VECTOR SEARCH
    // ========================================

    /*
     * Ask vectorStore for MORE candidates.
     *
     * We don't immediately take only 5.
     *
     * We retrieve 12 candidates and then
     * rank them using query-specific signals.
     */

    const initialResults =
        searchSimilar(
            query,
            queryEmbedding,
            candidateDocuments,
            12
        );


    console.log(
        "\nInitial vector results:",
        initialResults.length
    );


    // ========================================
    // RANK RESULTS
    // ========================================

    let results =
        rankResults(
            initialResults,
            query,
            queryType
        );


    // ========================================
    // REMOVE DUPLICATES
    // ========================================

    results =
        removeDuplicateSources(
            results
        );


    // ========================================
    // LIMIT FINAL RESULTS
    // ========================================

    results =
        results.slice(
            0,
            5
        );


    // ========================================
    // DEBUG
    // ========================================

    console.log(
        "\n===== RETRIEVED CHUNKS ====="
    );


    if (
        results.length === 0
    ) {

        console.log(
            "No relevant chunks found."
        );

    }


    results.forEach(
        (result, index) => {

            console.log(
                `\n--- Result ${index + 1} ---`
            );


            console.log(
                "Final Score:",
                result.score
            );


            console.log(
                "Original Score:",
                result.originalScore
            );


            console.log(
                "Relevance Boost:",
                result.relevanceBoost
            );


            console.log(
                "Semantic Score:",
                result.semanticScore
            );


            console.log(
                "Keyword Score:",
                result.keywordScore
            );


            console.log(
                "Source:",
                result.source
            );


            console.log(
                "Page:",
                result.page
            );


            console.log(
                "Chunk:",
                result.text.substring(
                    0,
                    500
                )
            );

        }
    );


    console.log(
        "\n============================\n"
    );


    return results;

}


// ============================================
// EXPORT
// ============================================

module.exports = {

    searchKnowledge,

    detectTopic,

    detectQueryType,

    filterByTopic

};