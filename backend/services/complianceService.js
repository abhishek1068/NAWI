const TestSession = require("../models/TestSession");
const TestResult = require("../models/TestResult");

// ==================================================
// CALCULATE OVERALL COMPLIANCE
// ==================================================

const calculateOverallCompliance = async (
    sessionId
) => {

    const session =
        await TestSession.findById(
            sessionId
        );

    if (!session) {
        throw new Error(
            "Test session not found"
        );
    }

    const results =
        await TestResult.find({
            testSession: sessionId
        });

    const applicableTests =
        session.applicableTests.filter(
            test =>
                test.applicable !== false
        );

    const totalTests =
        applicableTests.length;

    // ----------------------------------------------
    // No results
    // ----------------------------------------------

    if (results.length === 0) {

        return {
            overallResult:
                "REVIEW_REQUIRED",

            reason:
                "No test results have been recorded",

            totalTests,

            completedTests: 0,

            passedTests: 0,

            failedTests: 0,

            reviewRequiredTests:
                totalTests
        };
    }

    // ----------------------------------------------
    // Count results
    // ----------------------------------------------

    const passedTests =
        results.filter(
            result =>
                result.complianceStatus ===
                "PASS"
        ).length;

    const failedTests =
        results.filter(
            result =>
                result.complianceStatus ===
                "FAIL"
        ).length;

    const reviewRequiredTests =
        results.filter(
            result =>
                result.complianceStatus ===
                    "REVIEW_REQUIRED" ||
                result.complianceStatus ===
                    "PENDING"
        ).length;

    const completedTests =
        passedTests +
        failedTests;

    // ----------------------------------------------
    // Determine result
    // ----------------------------------------------

    let overallResult =
        "REVIEW_REQUIRED";

    let reason =
        "Testing is incomplete";

    if (failedTests > 0) {

        overallResult =
            "FAIL";

        reason =
            "One or more applicable tests failed";

    } else if (
        completedTests >= totalTests &&
        totalTests > 0 &&
        reviewRequiredTests === 0
    ) {

        overallResult =
            "PASS";

        reason =
            "All applicable tests passed";

    } else {

        overallResult =
            "REVIEW_REQUIRED";

        reason =
            "One or more applicable tests require completion or review";
    }

    return {
        overallResult,

        reason,

        totalTests,

        completedTests,

        passedTests,

        failedTests,

        reviewRequiredTests
    };
};


// ==================================================
// UPDATE SESSION RESULT
// ==================================================

const updateSessionCompliance = async (
    sessionId
) => {

    const compliance =
        await calculateOverallCompliance(
            sessionId
        );

    // IMPORTANT:
    // TestSession schema stores lowercase values.
    const databaseResult =
        compliance.overallResult === "PASS"
            ? "pass"
            : compliance.overallResult === "FAIL"
                ? "fail"
                : "review_required";

    const session =
        await TestSession.findByIdAndUpdate(

            sessionId,

            {
                overallResult:
                    databaseResult
            },

            {
                new: true,
                runValidators: true
            }
        );

    return {
        compliance,
        session
    };
};


module.exports = {
    calculateOverallCompliance,
    updateSessionCompliance
};