require("dotenv").config();

const {
    textToSpeech
} = require("./server/services/ttsService");


async function test() {

    try {

        const result =
            await textToSpeech(

                "Hello! Welcome to Coop Sahayak. I am here to help you with government schemes and farmer services.",

                "en-IN"

            );


        console.log(
            "\nSUCCESS!"
        );

        console.log(
            "Language:",
            result.language
        );

        console.log(
            "Speaker:",
            result.speaker
        );

        console.log(
            "Audio length:",
            result.audio.length
        );

    }

    catch (error) {

        console.error(
            "\nTEST FAILED"
        );

        console.error(
            error
        );

    }

}


test();