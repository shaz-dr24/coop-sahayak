const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const { createEmbedding } = require("./services/embeddingService");

const knowledgeBasePath = path.join(
    __dirname,
    "../knowledge-base"
);

const dataPath = path.join(
    __dirname,
    "../data"
);

const vectorStorePath = path.join(
    dataPath,
    "vector-store.json"
);


// ============================================
// FIND ALL TXT AND PDF FILES
// ============================================

function getAllDocuments(directory) {

    let files = [];

    const items = fs.readdirSync(directory);

    for (const item of items) {

        const fullPath = path.join(directory, item);

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {

            files = files.concat(
                getAllDocuments(fullPath)
            );

        } else if (
            item.endsWith(".txt") ||
            item.endsWith(".pdf")
        ) {

            files.push(fullPath);
        }
    }

    return files;
}


// ============================================
// CREATE CHUNKS
// ============================================

function createChunks(text, chunkSize = 500, overlap = 100) {

    const words = text.split(/\s+/);

    const chunks = [];

    let start = 0;

    while (start < words.length) {

        const end = Math.min(
            start + chunkSize,
            words.length
        );

        const chunk = words
            .slice(start, end)
            .join(" ");

        if (chunk.trim()) {
            chunks.push(chunk);
        }

        if (end === words.length) {
            break;
        }

        start = end - overlap;
    }

    return chunks;
}


// ============================================
// EXTRACT PDF PAGE BY PAGE
// ============================================

async function extractPdfPages(filePath) {

    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
        data: buffer
    });

    try {

        const result = await parser.getText();

        const pages = result.pages.map((page) => {
            return page.text;
        });

        return pages;

    } finally {

        await parser.destroy();
    }
}


// ============================================
// INGEST
// ============================================

async function ingest() {

    console.log("");
    console.log("=================================");
    console.log("Starting document ingestion...");
    console.log("=================================");
    console.log("");

    if (!fs.existsSync(dataPath)) {

        fs.mkdirSync(
            dataPath,
            {
                recursive: true
            }
        );
    }


    const files = getAllDocuments(
        knowledgeBasePath
    );

    console.log(
        `Found ${files.length} document(s)`
    );

    console.log("");


    const vectorStore = [];

    let documentId = 1;


    // ========================================
    // PROCESS EACH DOCUMENT
    // ========================================

    for (const file of files) {

        console.log(
            `Processing: ${file}`
        );


        // ====================================
        // PDF
        // ====================================

        if (file.endsWith(".pdf")) {

            const pages =
                await extractPdfPages(file);

            console.log(
                `Extracted ${pages.length} page(s)`
            );


            for (
                let pageNumber = 0;
                pageNumber < pages.length;
                pageNumber++
            ) {

                const pageText =
                    pages[pageNumber];

                if (
                    !pageText ||
                    pageText.trim() === ""
                ) {

                    continue;
                }


                const chunks =
                    createChunks(
                        pageText
                    );


                console.log(
                    `Page ${pageNumber + 1}: ${chunks.length} chunk(s)`
                );


                for (
                    let chunkIndex = 0;
                    chunkIndex < chunks.length;
                    chunkIndex++
                ) {

                    const chunk =
                        chunks[chunkIndex];


                    console.log(
                        `Creating embedding ${documentId}...`
                    );


                    const embedding =
                        await createEmbedding(
                            chunk, "passage"
                        );


                    vectorStore.push({

                        id: documentId,

                        text: chunk,

                        source:
                            path.relative(
                                knowledgeBasePath,
                                file
                            ),

                        page:
                            pageNumber + 1,

                        chunkIndex:
                            chunkIndex,

                        embedding:
                            embedding
                    });


                    documentId++;
                }
            }
        }


        // ====================================
        // TXT
        // ====================================

        else if (file.endsWith(".txt")) {

            const text =
                fs.readFileSync(
                    file,
                    "utf-8"
                );


            const chunks =
                createChunks(text);


            console.log(
                `Created ${chunks.length} chunk(s)`
            );


            for (
                let chunkIndex = 0;
                chunkIndex < chunks.length;
                chunkIndex++
            ) {

                const chunk =
                    chunks[chunkIndex];


                console.log(
                    `Creating embedding ${documentId}...`
                );


                const embedding =
                    await createEmbedding(
                        chunk
                    );


                vectorStore.push({

                    id: documentId,

                    text: chunk,

                    source:
                        path.relative(
                            knowledgeBasePath,
                            file
                        ),

                    page: null,

                    chunkIndex:
                        chunkIndex,

                    embedding:
                        embedding
                });


                documentId++;
            }
        }
    }


    // ========================================
    // SAVE VECTOR STORE
    // ========================================

    fs.writeFileSync(

        vectorStorePath,

        JSON.stringify(
            vectorStore,
            null,
            2
        )
    );


    console.log("");

    console.log(
        "================================="
    );

    console.log(
        "Knowledge ingestion completed!"
    );

    console.log(
        `Total chunks: ${vectorStore.length}`
    );

    console.log(
        `Saved to: ${vectorStorePath}`
    );

    console.log(
        "================================="
    );

    console.log("");
}


// ============================================
// START
// ============================================

ingest().catch(error => {

    console.error(
        "Ingestion failed:",
        error
    );

    process.exit(1);
});