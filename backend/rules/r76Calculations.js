const {
    R76_VERSION,
    MPE_INITIAL
} = require("./r76Constants");


function calculateMPE(
    accuracyClass,
    verificationScaleInterval,
    load,
    mode = "initial"
) {

    if (!accuracyClass) {
        throw new Error(
            "Accuracy class is required"
        );
    }

    if (!verificationScaleInterval ||
        verificationScaleInterval <= 0) {

        throw new Error(
            "Verification scale interval e must be greater than zero"
        );
    }

    if (load < 0) {
        throw new Error(
            "Load cannot be negative"
        );
    }

    const classRules =
        MPE_INITIAL[accuracyClass];

    if (!classRules) {
        throw new Error(
            `Unsupported accuracy class: ${accuracyClass}`
        );
    }

    const intervals =
        load / verificationScaleInterval;

    const rule =
        classRules.find(
            item =>
                intervals <= item.maxIntervals
        );

    if (!rule) {
        throw new Error(
            "Unable to determine MPE"
        );
    }

    let multiplier =
        rule.multiplier;

    /*
        R76-1:2006 3.5.2
        In-service MPE = twice initial MPE.
    */

    if (mode === "in_service") {
        multiplier *= 2;
    }

    const mpe =
        multiplier *
        verificationScaleInterval;

    return {
        ruleVersion: R76_VERSION,
        load,
        verificationScaleInterval,
        intervals,
        multiplier,
        mpe,
        mode
    };
}


function calculateError(
    indicatedValue,
    referenceLoad
) {

    if (
        typeof indicatedValue !== "number" ||
        typeof referenceLoad !== "number"
    ) {
        throw new Error(
            "Indicated value and reference load must be numbers"
        );
    }

    const error =
        indicatedValue - referenceLoad;

    return {
        indicatedValue,
        referenceLoad,
        error
    };
}


function evaluateCompliance(
    error,
    mpe
) {

    const absoluteError =
        Math.abs(error);

    const status =
        absoluteError <= mpe
            ? "PASS"
            : "FAIL";

    return {
        error,
        absoluteError,
        permissibleError: mpe,
        status
    };
}


function calculateRepeatability(
    readings
) {

    if (!Array.isArray(readings) ||
        readings.length < 2) {

        throw new Error(
            "At least two readings are required for repeatability"
        );
    }

    const maximum =
        Math.max(...readings);

    const minimum =
        Math.min(...readings);

    const difference =
        maximum - minimum;

    return {
        readings,
        maximum,
        minimum,
        difference
    };
}


module.exports = {
    calculateMPE,
    calculateError,
    evaluateCompliance,
    calculateRepeatability
};