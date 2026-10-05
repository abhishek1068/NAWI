const express = require("express");

const {
    registerInstrument,
    getInstruments,
    getInstrument,
    getLatestCompletedSession,
    startTestSession
} = require("../controllers/instrumentController");

const router =
    express.Router();


// Register new NAWI
router.post(
    "/",
    registerInstrument
);


// Get all instruments
router.get(
    "/",
    getInstruments
);


// Get latest completed session
// IMPORTANT: this must be BEFORE /:id
router.get(
    "/:id/latest-session",
    getLatestCompletedSession
);


// Get one instrument
router.get(
    "/:id",
    getInstrument
);


// Start OIML R76 testing
router.post(
    "/:id/start-test",
    startTestSession
);


module.exports = router;