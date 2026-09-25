// ============================================
// COSINE SIMILARITY
// ============================================

function cosineSimilarity(a, b) {

    if (!Array.isArray(a) || !Array.isArray(b)) {
        return 0;
    }

    if (a.length === 0 || b.length === 0) {
        return 0;
    }

    const length = Math.min(a.length, b.length);

    let dot = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < length; i++) {

        const valueA = Number(a[i]) || 0;
        const valueB = Number(b[i]) || 0;

        dot += valueA * valueB;

        magnitudeA += valueA * valueA;
        magnitudeB += valueB * valueB;
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dot / (
        Math.sqrt(magnitudeA) *
        Math.sqrt(magnitudeB)
    );
}


// ============================================
// NORMALIZE TEXT
// ============================================

function normalize(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s%]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ============================================
// KEYWORDS
// ============================================

function getKeywords(query) {

    const stopWords = new Set([

        // English
        "the",
        "is",
        "are",
        "was",
        "were",
        "what",
        "how",
        "why",
        "when",
        "where",
        "which",
        "who",
        "can",
        "could",
        "would",
        "should",
        "for",
        "and",
        "or",
        "the",
        "this",
        "that",
        "from",
        "with",
        "about",
        "please",
        "tell",
        "give",
        "me",
        "does",
        "do",
        "have",
        "has",
        "had",
        "need",
        "required",

        // Tanglish / Indian language filler
        "evlo",
        "enna",
        "enna",
        "eppo",
        "epdi",
        "epadi",
        "irukku",
        "irukkanum",
        "venum",
        "panna",
        "pannanum",
        "ku",
        "la",
        "il",
        "le",
        "ah",
        "na",
        "nu",
        "hai",
        "kya",
        "ka",
        "ki",
        "ke",
        "mein",
        "se"
    ]);


    return normalize(query)
        .split(" ")
        .filter(word =>
            word.length > 2 &&
            !stopWords.has(word)
        );
}


// ============================================
// KEYWORD SCORE
// ============================================

function keywordScore(query, text) {

    const keywords =
        getKeywords(query);

    const lowerText =
        normalize(text);

    if (keywords.length === 0) {
        return 0;
    }

    let matches = 0;

    for (const keyword of keywords) {

        if (lowerText.includes(keyword)) {
            matches++;
        }
    }

    return matches / keywords.length;
}


// ============================================
// IMPORTANT WORD SCORE
// ============================================

function importantWordScore(query, text) {

    const keywords =
        getKeywords(query);

    const lowerText =
        normalize(text);

    if (keywords.length === 0) {
        return 0;
    }

    let score = 0;

    for (const keyword of keywords) {

        // Longer words are usually more meaningful
        if (keyword.length >= 6 &&
            lowerText.includes(keyword)) {

            score += 1.5;

        } else if (
            lowerText.includes(keyword)
        ) {

            score += 1;
        }
    }

    const maximum =
        keywords.reduce(
            (total, word) =>
                total + (word.length >= 6 ? 1.5 : 1),
            0
        );

    if (maximum === 0) {
        return 0;
    }

    return score / maximum;
}


// ============================================
// PHRASE SCORE
// ============================================

function phraseScore(query, text) {

    const q =
        normalize(query);

    const t =
        normalize(text);

    let score = 0;


    // ========================================
    // PACS / BOARD
    // ========================================

    const boardPhrases = [

        "board of directors",

        "board directors",

        "minimum members",

        "maximum members",

        "number of members",

        "minimum number",

        "maximum number",

        "members in the board",

        "members of the board",

        "directors in the board",

        "directors of the board"
    ];


    for (const phrase of boardPhrases) {

        if (
            q.includes(phrase) &&
            t.includes(phrase)
        ) {

            score += 1.0;
        }
    }


    // ========================================
    // PMFBY / PREMIUM
    // ========================================

    const premiumPhrases = [

        "premium rate payable by farmer",

        "premium rate payable",

        "premium payable by farmer",

        "premium rates and premium subsidy",

        "maximum premium rate payable by farmer",

        "rate of premium payable by farmer",

        "farmer premium",

        "premium rate"
    ];


    for (const phrase of premiumPhrases) {

        if (
            q.includes(phrase) &&
            t.includes(phrase)
        ) {

            score += 1.0;
        }
    }


    // ========================================
    // GENERAL CONCEPT MATCHING
    // ========================================

    if (
        q.includes("premium") &&
        t.includes("premium")
    ) {

        score += 0.15;
    }


    if (
        q.includes("farmer") &&
        (
            t.includes("farmer") ||
            t.includes("farmers")
        )
    ) {

        score += 0.15;
    }


    if (
        q.includes("board") &&
        t.includes("board")
    ) {

        score += 0.20;
    }


    if (
        q.includes("director") &&
        t.includes("director")
    ) {

        score += 0.20;
    }


    if (
        q.includes("member") &&
        t.includes("member")
    ) {

        score += 0.20;
    }


    return Math.min(score, 1);
}


// ============================================
// PREMIUM QUESTION SCORE
// ============================================

function premiumQuestionScore(query, text) {

    const q =
        normalize(query);

    const t =
        normalize(text);


    const isPremiumQuestion =
        q.includes("premium") &&
        (
            q.includes("farmer") ||
            q.includes("rate") ||
            q.includes("evlo") ||
            q.includes("how much") ||
            q.includes("percentage") ||
            q.includes("percent")
        );


    if (!isPremiumQuestion) {
        return 0;
    }


    let score = 0;


    if (
        t.includes(
            "premium rates and premium subsidy"
        )
    ) {

        score += 1;
    }


    if (
        t.includes(
            "premium rate payable by farmer"
        )
    ) {

        score += 1;
    }


    if (
        t.includes(
            "maximum premium rate payable by farmer"
        )
    ) {

        score += 1;
    }


    if (
        t.includes("kharif") &&
        t.includes("rabi") &&
        t.includes("5%")
    ) {

        score += 0.5;
    }


    return Math.min(score, 1);
}


// ============================================
// PACS BOARD QUESTION SCORE
// ============================================

function boardQuestionScore(query, text) {

    const q =
        normalize(query);

    const t =
        normalize(text);


    const isBoardQuestion =
        (
            q.includes("board") ||
            q.includes("director") ||
            q.includes("directors")
        ) &&
        (
            q.includes("member") ||
            q.includes("members") ||
            q.includes("minimum") ||
            q.includes("maximum") ||
            q.includes("number")
        );


    if (!isBoardQuestion) {
        return 0;
    }


    let score = 0;


    // Exact important phrase
    if (
        t.includes("board of directors")
    ) {

        score += 0.5;
    }


    // The actual answer is likely near
    // minimum / maximum / members
    if (
        t.includes("minimum")
    ) {

        score += 0.2;
    }


    if (
        t.includes("maximum")
    ) {

        score += 0.2;
    }


    if (
        t.includes("members")
    ) {

        score += 0.2;
    }


    // Numbers are useful for this type
    // of question
    if (
        t.includes("11") &&
        t.includes("21")
    ) {

        score += 0.5;
    }


    return Math.min(score, 1);
}


// ============================================
// SEARCH
// ============================================

function searchSimilar(
    query,
    queryEmbedding,
    documents,
    topK = 5
) {

    if (!Array.isArray(documents)) {

        console.error(
            "ERROR: documents is not an array"
        );

        return [];
    }


    const results = documents

        // Remove broken entries
        .filter(document =>

            document &&
            typeof document.text === "string" &&
            Array.isArray(document.embedding)

        )


        .map(document => {

            // ====================================
            // SEMANTIC
            // ====================================

            const semanticScore =
                cosineSimilarity(
                    queryEmbedding,
                    document.embedding
                );


            // ====================================
            // KEYWORDS
            // ====================================

            const keywords =
                keywordScore(
                    query,
                    document.text
                );


            // ====================================
            // IMPORTANT WORDS
            // ====================================

            const important =
                importantWordScore(
                    query,
                    document.text
                );


            // ====================================
            // PHRASES
            // ====================================

            const phrases =
                phraseScore(
                    query,
                    document.text
                );


            // ====================================
            // PREMIUM
            // ====================================

            const premiumScore =
                premiumQuestionScore(
                    query,
                    document.text
                );


            // ====================================
            // BOARD
            // ====================================

            const boardScore =
                boardQuestionScore(
                    query,
                    document.text
                );


            // ====================================
            // FINAL SCORE
            // ====================================

            const score =

                (semanticScore * 0.40) +

                (keywords * 0.15) +

                (important * 0.15) +

                (phrases * 0.10) +

                (premiumScore * 0.10) +

                (boardScore * 0.10);


            return {

                ...document,

                score,

                semanticScore,

                keywordScore:
                    keywords,

                importantWordScore:
                    important,

                phraseScore:
                    phrases,

                premiumScore,

                boardScore
            };
        })


        // ========================================
        // SORT
        // ========================================

        .sort(
            (a, b) =>
                b.score - a.score
        );


    // ========================================
    // DEBUG
    // ========================================

    console.log(
        `\nSearching ${documents.length} documents`
    );

    console.log(
        `Query: ${query}`
    );

    console.log(
        `Returning top ${topK} results`
    );


    return results.slice(
        0,
        topK
    );
}


// ============================================
// EXPORT
// ============================================

module.exports = {

    cosineSimilarity,

    keywordScore,

    importantWordScore,

    phraseScore,

    premiumQuestionScore,

    boardQuestionScore,

    searchSimilar

};