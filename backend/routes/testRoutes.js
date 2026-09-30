const express = require("express");

const {
    getTestSession,
    getTestPlan,
    saveObservation,
    calculateIndicationTest,
    calculateRepeatability,
    getCompliance,
    recalculateCompliance
} = require("../controllers/testController");

const router = express.Router();

// ==================================================
// TEST SESSION
// ==================================================

router.get(
    "/sessions/:id",
    getTestSession
);

// ==================================================
// TEST PLAN
// ==================================================

router.get(
    "/sessions/:id/test-plan",
    getTestPlan
);

// ==================================================
// OBSERVATIONS
// ==================================================

router.post(
    "/sessions/:id/observations",
    saveObservation
);

// ==================================================
// CALCULATIONS
// ==================================================

router.post(
    "/sessions/:id/calculate/indication",
    calculateIndicationTest
);

router.post(
    "/sessions/:id/calculate/repeatability",
    calculateRepeatability
);

// ==================================================
// COMPLIANCE
// ==================================================

router.get(
    "/sessions/:id/compliance",
    getCompliance
);

router.post(
    "/sessions/:id/recalculate",
    recalculateCompliance
);

module.exports = router;