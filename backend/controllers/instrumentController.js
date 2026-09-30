const Instrument = require("../models/Instrument");
const TestSession = require("../models/TestSession");
const {
    determineApplicability
} = require("../rules/r76Applicability");

// ---------------------------------------------
// REGISTER INSTRUMENT
// ---------------------------------------------

const registerInstrument = async (req, res, next) => {
    try {

        const instrument = await Instrument.create({
            ...req.body,
            registeredBy: null,
            registeredByName: "NAWI SmartLab Demo"
        });

        res.status(201).json({
            success: true,
            message: "Instrument registered successfully",
            instrument
        });

    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------
// GET ALL INSTRUMENTS
// ---------------------------------------------

const getInstruments = async (req, res, next) => {
    try {

        const instruments =
            await Instrument.find()
                .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: instruments.length,
            instruments
        });

    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------
// GET ONE INSTRUMENT
// ---------------------------------------------

const getInstrument = async (req, res, next) => {
    try {

        const instrument =
            await Instrument.findById(
                req.params.id
            );

        if (!instrument) {
            return res.status(404).json({
                success: false,
                message: "Instrument not found"
            });
        }

        res.json({
            success: true,
            instrument
        });

    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------
// START TEST SESSION
// AUTOMATIC R76 TEST PLAN
// ---------------------------------------------

const startTestSession = async (req, res, next) => {
    try {

        const instrument =
            await Instrument.findById(
                req.params.id
            );

        if (!instrument) {
            return res.status(404).json({
                success: false,
                message: "Instrument not found"
            });
        }

        const applicableTests =
            determineApplicability(
                instrument.toObject()
            );

        const timestamp =
            Date.now();

        const sessionNumber =
            `TS-${timestamp}`;

        const reportNumber =
            `R76-${timestamp}`;

        const session =
            await TestSession.create({
                instrument: instrument._id,

                sessionNumber,

                reportNumber,

                standard: {
                    name: "OIML R 76",
                    version: "2006"
                },

                testType:
                    "Type Evaluation",

                applicableTests,

                status: "testing",

                overallResult: "pending",

                technician: null,

                technicianName:
                    "NAWI SmartLab Technician",

                startedAt:
                    new Date()
            });

        instrument.status =
            "testing";

        await instrument.save();

        res.status(201).json({
            success: true,
            message:
                "Test session created and OIML R76 test plan generated",

            session: {
                id: session._id,
                sessionNumber:
                    session.sessionNumber,
                reportNumber:
                    session.reportNumber,
                standard:
                    session.standard,
                status:
                    session.status,
                overallResult:
                    session.overallResult
            },

            testPlan: applicableTests
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerInstrument,
    getInstruments,
    getInstrument,
    startTestSession
};