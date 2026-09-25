const { pipeline } = require("@huggingface/transformers");


// ============================================================
// MULTILINGUAL EMBEDDING MODEL
// ============================================================

const MODEL =
    "Xenova/multilingual-e5-base";


let extractor = null;


// ============================================================
// LOAD MODEL
// ============================================================

async function getExtractor() {

    if (!extractor) {

        console.log("");
        console.log("=================================");
        console.log("Loading multilingual embedding model...");
        console.log(`Model: ${MODEL}`);
        console.log("=================================");
        console.log("");


        extractor =
            await pipeline(
                "feature-extraction",
                MODEL
            );


        console.log(
            "Multilingual embedding model loaded."
        );
    }


    return extractor;
}


// ============================================================
// CREATE EMBEDDING
// ============================================================

async function createEmbedding(
    text,
    type = "passage"
) {

    if (
        !text ||
        !String(text).trim()
    ) {

        throw new Error(
            "Cannot create embedding from empty text."
        );
    }


    const model =
        await getExtractor();


    const cleanText =
        String(text).trim();


    // E5-style prefixes.
    //
    // Documents:
    // passage: ...
    //
    // User questions:
    // query: ...

    const input =
        type === "query"
            ? `query: ${cleanText}`
            : `passage: ${cleanText}`;


    const output =
        await model(
            input,
            {
                pooling: "mean",
                normalize: true
            }
        );


    return Array.from(
        output.data
    );
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    createEmbedding,

    getExtractor

};