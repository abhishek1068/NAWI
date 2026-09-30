const {
    calculateMPE,
    calculateError,
    evaluateCompliance,
    calculateRepeatability
} = require("../rules/r76Calculations");


function calculateWeighingPerformance({
    accuracyClass,
    verificationScaleInterval,
    referenceLoad,
    indicatedValue,
    mode = "initial"
}) {

    const errorResult =
        calculateError(
            indicatedValue,
            referenceLoad
        );

    const mpeResult =
        calculateMPE(
            accuracyClass,
            verificationScaleInterval,
            referenceLoad,
            mode
        );

    const compliance =
        evaluateCompliance(
            errorResult.error,
            mpeResult.mpe
        );

    return {
        testCode: "INDICATION_ERROR",

        inputs: {
            referenceLoad,
            indicatedValue,
            accuracyClass,
            verificationScaleInterval
        },

        calculations: [
            {
                parameter: "error",
                value: errorResult.error,
                unit: "same as load",
                formula: "indicated value - reference load"
            },
            {
                parameter: "load in verification intervals",
                value: mpeResult.intervals,
                unit: "e"
            },
            {
                parameter: "MPE multiplier",
                value: mpeResult.multiplier,
                unit: "e"
            }
        ],

        observedError: {
            value: errorResult.error
        },

        permissibleError: {
            value: mpeResult.mpe
        },

        complianceStatus:
            compliance.status,

        explanation:
            `${compliance.status}: absolute error ${compliance.absoluteError} is compared with permissible error ${compliance.permissibleError}.`,

        ruleVersion:
            mpeResult.ruleVersion
    };
}


function calculateRepeatabilityResult({
    readings,
    accuracyClass,
    verificationScaleInterval,
    referenceLoad,
    mode = "initial"
}) {

    const repeatability =
        calculateRepeatability(
            readings
        );

    const mpeResult =
        calculateMPE(
            accuracyClass,
            verificationScaleInterval,
            referenceLoad,
            mode
        );

    const status =
        repeatability.difference <=
        mpeResult.mpe
            ? "PASS"
            : "FAIL";

    return {
        testCode: "REPEATABILITY",

        inputs: {
            readings,
            referenceLoad,
            accuracyClass,
            verificationScaleInterval
        },

        calculations: [
            {
                parameter: "maximum reading",
                value: repeatability.maximum
            },
            {
                parameter: "minimum reading",
                value: repeatability.minimum
            },
            {
                parameter: "difference",
                value: repeatability.difference
            }
        ],

        permissibleError: {
            value: mpeResult.mpe
        },

        complianceStatus: status,

        explanation:
            `${status}: difference between repeat readings is compared with the applicable maximum permissible error.`,

        ruleVersion:
            mpeResult.ruleVersion
    };
}


module.exports = {
    calculateWeighingPerformance,
    calculateRepeatabilityResult
};