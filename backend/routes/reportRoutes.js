const express = require("express");

const {
    createReport,
    getReport,
    getSessionReports
} = require("../controllers/reportController");

const router = express.Router();


// Generate PDF + DOCX
router.post(
    "/session/:sessionId/generate",
    createReport
);


// Get reports for a session
router.get(
    "/session/:sessionId",
    getSessionReports
);


// Get single report
router.get(
    "/:id",
    getReport
);


module.exports = router;