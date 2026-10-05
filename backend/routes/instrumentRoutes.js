const express = require("express");

const {

    registerInstrument,

    getInstruments,

    getInstrument,

    deleteInstrument,

    startTestSession

} = require(
    "../controllers/instrumentController"
);


const router =
    express.Router();


// ---------------------------------------------
// REGISTER
// ---------------------------------------------

router.post(
    "/",
    registerInstrument
);


// ---------------------------------------------
// GET ALL
// ---------------------------------------------

router.get(
    "/",
    getInstruments
);


// ---------------------------------------------
// DELETE
// IMPORTANT: keep before /:id
// ---------------------------------------------

router.delete(
    "/:id",
    deleteInstrument
);


// ---------------------------------------------
// GET ONE
// ---------------------------------------------

router.get(
    "/:id",
    getInstrument
);


// ---------------------------------------------
// START TEST
// ---------------------------------------------

router.post(
    "/:id/start-test",
    startTestSession
);


module.exports = router;