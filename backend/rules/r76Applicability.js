const R76_TESTS = require("./r76Tests");

function determineApplicability(instrument) {

    const tests = [];

    for (const test of R76_TESTS) {

        let applicable = test.defaultApplicable;

        // -----------------------------------------
        // TARE FUNCTION
        // -----------------------------------------

        if (
            test.requires === "tareFunction"
        ) {
            applicable =
                instrument.tareFunction === true;
        }

        // -----------------------------------------
        // MULTIPLE INDICATING DEVICES
        // -----------------------------------------

        if (
            test.requires ===
            "multipleIndicatingDevices"
        ) {
            applicable =
                instrument.multipleIndicatingDevices === true;
        }

        // -----------------------------------------
        // MOBILE INSTRUMENT
        // -----------------------------------------

        if (
            test.requires === "mobileInstrument"
        ) {
            applicable =
                instrument.mobileInstrument === true;
        }

        // -----------------------------------------
        // NON-DIGITAL INDICATION
        // -----------------------------------------

        if (
            test.requires ===
            "nonDigitalIndication"
        ) {
            applicable =
                instrument.digitalIndication !== true;
        }

        tests.push({
            code: test.code,
            name: test.name,
            category: test.category,
            applicable: applicable,

            status: applicable
                ? "pending"
                : "not_applicable"
        });
    }

    return tests;
}

module.exports = {
    determineApplicability
};