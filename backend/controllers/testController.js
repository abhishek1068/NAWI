const TestSession = require("../models/TestSession");
const Observation = require("../models/Observation");
const TestResult = require("../models/TestResult");

const {
    calculateWeighingPerformance,
    calculateRepeatabilityResult
} = require("../services/calculationService");

const {
    calculateOverallCompliance,
    updateSessionCompliance
} = require("../services/complianceService");

// ==================================================
// GET TEST SESSION
// ==================================================

const getTestSession = async (req, res, next) => {
    try {

        const session =
            await TestSession.findById(
                req.params.id
            ).populate("instrument");

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Test session not found"
            });
        }

        res.json({
            success: true,
            session
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET TEST PLAN
// ==================================================

const getTestPlan = async (req, res, next) => {
    try {

        const session =
            await TestSession.findById(
                req.params.id
            );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Test session not found"
            });
        }

        res.json({
            success: true,

            sessionId:
                session._id,

            sessionNumber:
                session.sessionNumber,

            reportNumber:
                session.reportNumber,

            standard:
                session.standard,

            status:
                session.status,

            testPlan:
                session.applicableTests
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// SAVE OBSERVATION
// ==================================================

const saveObservation = async (
    req,
    res,
    next
) => {

    try {

        const session =
            await TestSession.findById(
                req.params.id
            );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Test session not found"
            });
        }

        const {
            testCode,
            testName,
            observationNumber,
            referenceLoad,
            indicatedValue,
            position,
            unit,
            rawValue,
            textValue,
            notes
        } = req.body;

        if (!testCode || !testName) {
            return res.status(400).json({
                success: false,
                message:
                    "testCode and testName are required"
            });
        }

        const observation =
            await Observation.create({

                testSession:
                    session._id,

                testCode,

                testName,

                observationNumber:
                    observationNumber || 1,

                referenceLoad,

                indicatedValue,

                position,

                unit:
                    unit || "kg",

                rawValue,

                textValue,

                notes,

                enteredBy: null,

                validationStatus:
                    "pending"
            });

        res.status(201).json({
            success: true,

            message:
                "Observation saved successfully",

            observation
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// CALCULATE INDICATION ERROR
// ==================================================

const calculateIndicationTest = async (
    req,
    res,
    next
) => {

    try {

        const session =
            await TestSession.findById(
                req.params.id
            ).populate("instrument");

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Test session not found"
            });
        }

        const {
            referenceLoad,
            indicatedValue,
            mode
        } = req.body;

        if (
            referenceLoad === undefined ||
            indicatedValue === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "referenceLoad and indicatedValue are required"
            });
        }

        const instrument =
            session.instrument;

        const calculation =
            calculateWeighingPerformance({

                accuracyClass:
                    instrument.accuracyClass,

                verificationScaleInterval:
                    instrument.verificationScaleInterval,

                referenceLoad:
                    Number(referenceLoad),

                indicatedValue:
                    Number(indicatedValue),

                mode:
                    mode || "initial"
            });

        const calculationId =
            `CAL-${Date.now()}`;

        const result =
            await TestResult.create({

                testSession:
                    session._id,

                testCode:
                    "INDICATION_ERROR",

                testName:
                    "Errors of indication",

                ruleVersion:
                    "R76-2006",

                calculationId,

                inputs: {
                    referenceLoad:
                        Number(referenceLoad),

                    indicatedValue:
                        Number(indicatedValue),

                    mode:
                        mode || "initial"
                },

                calculations: [

                    {
                        parameter:
                            "Observed Error",

                        value:
                            calculation.error,

                        unit:
                            instrument.unit,

                        formula:
                            "indicated value - reference load"
                    },

                    {
                        parameter:
                            "Permissible Error",

                        value:
                            calculation.mpe,

                        unit:
                            instrument.unit,

                        formula:
                            calculation.rule
                    }

                ],

                permissibleError: {
                    value:
                        calculation.mpe,

                    unit:
                        instrument.unit
                },

                observedError: {
                    value:
                        calculation.error,

                    unit:
                        instrument.unit
                },

                complianceStatus:
                    calculation.compliance,

                explanation:
                    `Observed error = ${calculation.error} ${instrument.unit}. ` +
                    `Permissible error = ±${calculation.mpe} ${instrument.unit}. ` +
                    `Result = ${calculation.compliance}.`,

                ruleBasis: {

                    clause:
                        "R76-1:2006 §3.5.1",

                    description:
                        "Maximum permissible errors at initial verification"
                }

            });

        // Update overall session status
        const overall =
            await updateSessionCompliance(
                session._id
            );

        res.json({

            success: true,

            result: {

                calculationId,

                observedError:
                    calculation.error,

                permissibleError:
                    calculation.mpe,

                compliance:
                    calculation.compliance,

                rule:
                    calculation.rule

            },

            overallCompliance:
                overall.compliance

        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// CALCULATE REPEATABILITY
// ==================================================

const calculateRepeatability = async (
    req,
    res,
    next
) => {

    try {

        const session =
            await TestSession.findById(
                req.params.id
            ).populate("instrument");

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Test session not found"
            });
        }

        const {
            readings,
            referenceLoad,
            mode
        } = req.body;

        if (
            !Array.isArray(readings) ||
            readings.length < 2
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least two readings are required"
            });
        }

        const instrument =
            session.instrument;

        const result =
            calculateRepeatabilityResult({

                readings:
                    readings.map(Number),

                accuracyClass:
                    instrument.accuracyClass,

                verificationScaleInterval:
                    instrument.verificationScaleInterval,

                referenceLoad:
                    Number(referenceLoad),

                mode:
                    mode || "initial"

            });

        const calculationId =
            `CAL-${Date.now()}`;

        await TestResult.create({

            testSession:
                session._id,

            testCode:
                "REPEATABILITY",

            testName:
                "Repeatability",

            ruleVersion:
                "R76-2006",

            calculationId,

            inputs: {
                readings,
                referenceLoad,
                mode
            },

            calculations: [

                {
                    parameter:
                        "Maximum reading",

                    value:
                        result.maximum,

                    unit:
                        instrument.unit
                },

                {
                    parameter:
                        "Minimum reading",

                    value:
                        result.minimum,

                    unit:
                        instrument.unit
                },

                {
                    parameter:
                        "Difference",

                    value:
                        result.difference,

                    unit:
                        instrument.unit,

                    formula:
                        "maximum reading - minimum reading"
                }

            ],

            permissibleError: {

                value:
                    result.mpe,

                unit:
                    instrument.unit

            },

            observedError: {

                value:
                    result.difference,

                unit:
                    instrument.unit

            },

            complianceStatus:
                result.compliance,

            explanation:
                `Repeatability difference = ${result.difference} ${instrument.unit}. ` +
                `Permissible error = ±${result.mpe} ${instrument.unit}. ` +
                `Result = ${result.compliance}.`,

            ruleBasis: {

                clause:
                    "R76-1:2006 §3.6.1",

                description:
                    "Repeatability requirement"

            }

        });

        // Update overall result
        const overall =
            await updateSessionCompliance(
                session._id
            );

        res.json({

            success: true,

            result: {

                calculationId,

                maximum:
                    result.maximum,

                minimum:
                    result.minimum,

                difference:
                    result.difference,

                permissibleError:
                    result.mpe,

                compliance:
                    result.compliance

            },

            overallCompliance:
                overall.compliance

        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET OVERALL COMPLIANCE
// ==================================================

const getCompliance = async (
    req,
    res,
    next
) => {

    try {

        const compliance =
            await calculateOverallCompliance(
                req.params.id
            );

        res.json({
            success: true,
            compliance
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// RECALCULATE OVERALL COMPLIANCE
// ==================================================

const recalculateCompliance = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await updateSessionCompliance(
                req.params.id
            );

        res.json({
            success: true,

            message:
                "Overall compliance recalculated",

            compliance:
                result.compliance,

            session: {
                id:
                    result.session._id,

                overallResult:
                    result.session.overallResult
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {

    getTestSession,

    getTestPlan,

    saveObservation,

    calculateIndicationTest,

    calculateRepeatability,

    getCompliance,

    recalculateCompliance

};