const express = require("express");

const {
    recordTestResult,
    getSessionCompliance
} = require("../controllers/testResultController");


const router =
    express.Router();


router.post(
    "/record",
    recordTestResult
);


router.get(
    "/session/:sessionId/compliance",
    getSessionCompliance
);


module.exports = router;