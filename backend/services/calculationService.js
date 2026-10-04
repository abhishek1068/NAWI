const {
    calculateMPE,
    calculateError,
    evaluateCompliance,
    calculateRepeatability
} = require("../rules/r76Calculations");


// ==========================================================
// WEIGHING PERFORMANCE / INDICATION ERROR
// ==========================================================

function calculateWeighingPerformance({
    accuracyClass,
    verificationScaleInterval,
    referenceLoad,
    indicatedValue,
    mode = "initial"
}) {

    const errorResult =
        calculateError(
            Number(indicatedValue),
            Number(referenceLoad)
        );


    const mpeResult =
        calculateMPE(
            accuracyClass,
            Number(verificationScaleInterval),
            Number(referenceLoad),
            mode
        );


    const compliance =
        evaluateCompliance(
            errorResult.error,
            mpeResult.mpe
        );


    return {

        testCode:
            "INDICATION_ERROR",

        inputs: {

            referenceLoad:
                Number(referenceLoad),

            indicatedValue:
                Number(indicatedValue),

            accuracyClass,

            verificationScaleInterval:
                Number(verificationScaleInterval)

        },

        calculations: [

            {
                parameter:
                    "error",

                value:
                    errorResult.error,

                unit:
                    "same as load",

                formula:
                    "indicated value - reference load"
            },

            {
                parameter:
                    "load in verification intervals",

                value:
                    mpeResult.intervals,

                unit:
                    "e"
            },

            {
                parameter:
                    "MPE multiplier",

                value:
                    mpeResult.multiplier,

                unit:
                    "e"
            },

            {
                parameter:
                    "permissible error",

                value:
                    mpeResult.mpe,

                unit:
                    "same as load",

                formula:
                    "MPE multiplier × verification scale interval"
            }

        ],


        observedError: {

            value:
                errorResult.error

        },


        permissibleError: {

            value:
                mpeResult.mpe

        },


        complianceStatus:
            compliance.status,


        explanation:
            `${compliance.status}: absolute error ${compliance.absoluteError} is compared with permissible error ${compliance.permissibleError}.`,


        ruleVersion:
            mpeResult.ruleVersion,


        // --------------------------------------------------
        // BACKWARD-COMPATIBLE FIELDS
        // --------------------------------------------------
        // testController.js currently uses these names.
        // Keep them so the existing backend controller
        // continues to work without breaking anything.

        error:
            errorResult.error,

        mpe:
            mpeResult.mpe,

        compliance:
            compliance.status,

        rule:
            `R76-1:2006 §3.5.1`

    };

}


// ==========================================================
// REPEATABILITY
// ==========================================================

function calculateRepeatabilityResult({
    readings,
    accuracyClass,
    verificationScaleInterval,
    referenceLoad,
    mode = "initial"
}) {

    const numericReadings =
        readings.map(Number);


    const repeatability =
        calculateRepeatability(
            numericReadings
        );


    const mpeResult =
        calculateMPE(
            accuracyClass,
            Number(verificationScaleInterval),
            Number(referenceLoad),
            mode
        );


    const status =
        repeatability.difference <=
        mpeResult.mpe
            ? "PASS"
            : "FAIL";


    return {

        testCode:
            "REPEATABILITY",


        inputs: {

            readings:
                numericReadings,

            referenceLoad:
                Number(referenceLoad),

            accuracyClass,

            verificationScaleInterval:
                Number(verificationScaleInterval)

        },


        calculations: [

            {
                parameter:
                    "maximum reading",

                value:
                    repeatability.maximum,

                unit:
                    "same as load"
            },

            {
                parameter:
                    "minimum reading",

                value:
                    repeatability.minimum,

                unit:
                    "same as load"
            },

            {
                parameter:
                    "difference",

                value:
                    repeatability.difference,

                unit:
                    "same as load",

                formula:
                    "maximum reading - minimum reading"
            },

            {
                parameter:
                    "permissible error",

                value:
                    mpeResult.mpe,

                unit:
                    "same as load",

                formula:
                    "applicable R76 MPE"
            }

        ],


        permissibleError: {

            value:
                mpeResult.mpe

        },


        complianceStatus:
            status,


        explanation:
            `${status}: difference between repeat readings is compared with the applicable maximum permissible error.`,


        ruleVersion:
            mpeResult.ruleVersion,


        // --------------------------------------------------
        // BACKWARD-COMPATIBLE FIELDS
        // --------------------------------------------------

        maximum:
            repeatability.maximum,

        minimum:
            repeatability.minimum,

        difference:
            repeatability.difference,

        mpe:
            mpeResult.mpe,

        compliance:
            status

    };

}


// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {

    calculateWeighingPerformance,

    calculateRepeatabilityResult

};