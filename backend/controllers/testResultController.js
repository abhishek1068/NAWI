const mongoose = require("mongoose");

const TestSession = require("../models/TestSession");
const TestResult = require("../models/TestResult");
const Instrument = require("../models/Instrument");

function normalizeStatus(value) {

    const status =
        String(value || "")
            .trim()
            .toUpperCase();

    if (status === "PASS") {
        return "PASS";
    }

    if (status === "FAIL") {
        return "FAIL";
    }

    if (status === "NOT_APPLICABLE") {
        return "NOT_APPLICABLE";
    }

    return "REVIEW_REQUIRED";
}


function applicableTestsFor(session) {

    return (
        session.applicableTests || []
    ).filter(
        test =>
            test.applicable !== false &&
            test.status !==
                "not_applicable"
    );
}


async function loadResults(
    sessionId
) {

    return TestResult.collection
        .find({
            testSession:
                new mongoose.Types.ObjectId(
                    sessionId
                )
        })
        .sort({
            createdAt: 1
        })
        .toArray();
}


// ==========================================================
// RECORD / UPDATE ONE TEST RESULT
// ==========================================================

const recordTestResult =
    async (req, res) => {

        try {

            const {
                sessionId,
                testCode,
                testName,
                complianceStatus,
                calculationResult,
                calculation,
                observation,
                rawObservations
            } = req.body;


            if (!sessionId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Session ID is required."

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    sessionId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid session ID."

                });

            }


            if (!testCode) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Test code is required."

                });

            }


            const session =
                await TestSession.findById(
                    sessionId
                );


            if (!session) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Test session not found."

                });

            }


            if (
                session.status ===
                "completed"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This evaluation is already completed."

                });

            }


            const applicableTests =
                applicableTestsFor(
                    session
                );


            const testIndex =
                applicableTests.findIndex(
                    test =>
                        test.code ===
                        testCode
                );


            if (testIndex === -1) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This test is not applicable to the current evaluation."

                });

            }


            const savedResults =
                await loadResults(
                    sessionId
                );


            const completedCodes =
                new Set(
                    savedResults
                        .filter(
                            result =>
                                [
                                    "PASS",
                                    "FAIL"
                                ].includes(
                                    normalizeStatus(
                                        result.complianceStatus
                                    )
                                )
                        )
                        .map(
                            result =>
                                result.testCode
                        )
                );


            const firstIncompleteIndex =
                applicableTests.findIndex(
                    test =>
                        !completedCodes.has(
                            test.code
                        )
                );


            const expectedIndex =
                firstIncompleteIndex === -1
                    ? applicableTests.length - 1
                    : firstIncompleteIndex;


            if (
                testIndex >
                expectedIndex
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        `Complete test ${expectedIndex + 1} before test ${testIndex + 1}.`,

                    expectedTest:
                        applicableTests[
                            expectedIndex
                        ]

                });

            }


            const status =
    normalizeStatus(
        complianceStatus ||

        calculationResult
            ?.result
            ?.compliance ||

        calculationResult
            ?.result
            ?.complianceStatus ||

        calculationResult
            ?.compliance ||

        calculationResult
            ?.complianceStatus ||

        calculation
            ?.result
            ?.compliance ||

        calculation
            ?.result
            ?.complianceStatus ||

        calculation
            ?.compliance ||

        calculation
            ?.complianceStatus
    );


            if (
                ![
                    "PASS",
                    "FAIL"
                ].includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A test must have a final PASS or FAIL result before it can be completed."

                });

            }


            const now =
                new Date();


            const calculationId =
                calculationResult
                    ?.result
                    ?.calculationId ||

                calculationResult
                    ?.calculationId ||

                calculation
                    ?.result
                    ?.calculationId ||

                calculation
                    ?.calculationId ||

                `CAL-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;


            const storedCalculation =
                calculationResult ||
                calculation ||
                {
                    complianceStatus:
                        status
                };


            await TestResult.collection.updateOne(

                {
                    testSession:
                        session._id,

                    testCode
                },

                {
                    $set: {

                        testSession:
                            session._id,

                        testCode,

                        testName:
                            testName ||
                            testCode,

                        ruleVersion:
                            "R76-2006",

                        calculationId,

                        calculation:
                            storedCalculation,

                        inputs:
                            observation ||
                            {},

                        observation:
                            observation ||
                            {},

                        rawObservations:
                            rawObservations ||
                            observation ||
                            {},

                        complianceStatus:
                            status,

                        explanation:
                            storedCalculation
                                ?.explanation ||
                            `${testName || testCode} recorded as ${status}.`,

                        calculatedBy:
                            "NAWI SmartLab",

                        calculatedAt:
                            now,

                        recordedAt:
                            now,

                        updatedAt:
                            now

                    },

                    $setOnInsert: {

                        createdAt:
                            now

                    }

                },

                {
                    upsert: true
                }

            );


            const subTest =
                session.applicableTests.find(
                    test =>
                        test.code ===
                        testCode
                );


            if (subTest) {

                subTest.status =
                    status === "PASS"
                        ? "passed"
                        : "failed";

            }


            /*
             * IMPORTANT:
             *
             * A saved individual test does NOT
             * complete the whole evaluation.
             */

            session.status =
                "testing";

            session.overallResult =
                "pending";


            await session.save();


            const refreshedResults =
                await loadResults(
                    sessionId
                );


            const completedTests =
                refreshedResults.filter(
                    result =>
                        [
                            "PASS",
                            "FAIL"
                        ].includes(
                            normalizeStatus(
                                result.complianceStatus
                            )
                        )
                ).length;


            const passedTests =
                refreshedResults.filter(
                    result =>
                        normalizeStatus(
                            result.complianceStatus
                        ) === "PASS"
                ).length;


            const failedTests =
                refreshedResults.filter(
                    result =>
                        normalizeStatus(
                            result.complianceStatus
                        ) === "FAIL"
                ).length;


            const allComplete =
                completedTests >=
                applicableTests.length;


            return res.json({

                success: true,

                message:
                    "Test result saved successfully.",

                data: {

                    sessionId:
                        session._id,

                    testCode,

                    complianceStatus:
                        status,

                    totalTests:
                        applicableTests.length,

                    completedTests,

                    passedTests,

                    failedTests,

                    allTestsComplete:
                        allComplete,

                    nextTest:
                        allComplete
                            ? null
                            : applicableTests[
                                completedTests
                            ]

                }

            });

        }

        catch (error) {

            console.error(
                "recordTestResult error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to save test result."

            });

        }

    };


// ==========================================================
// GET SESSION PROGRESS / COMPLIANCE
// ==========================================================

const getSessionCompliance =
    async (req, res) => {

        try {

            const {
                sessionId
            } = req.params;


            if (
                !mongoose.Types.ObjectId.isValid(
                    sessionId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid session ID."

                });

            }


            const session =
                await TestSession.findById(
                    sessionId
                );


            if (!session) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Test session not found."

                });

            }


            const applicableTests =
                applicableTestsFor(
                    session
                );


            const results =
                await loadResults(
                    sessionId
                );


            const completedCodes =
                new Set(
                    results
                        .filter(
                            result =>
                                [
                                    "PASS",
                                    "FAIL"
                                ].includes(
                                    normalizeStatus(
                                        result.complianceStatus
                                    )
                                )
                        )
                        .map(
                            result =>
                                result.testCode
                        )
                );


            const passedTests =
                results.filter(
                    result =>
                        normalizeStatus(
                            result.complianceStatus
                        ) === "PASS"
                ).length;


            const failedTests =
                results.filter(
                    result =>
                        normalizeStatus(
                            result.complianceStatus
                        ) === "FAIL"
                ).length;


            const completedTests =
                completedCodes.size;


            const allTestsComplete =
                completedTests >=
                applicableTests.length;


            let overallResult =
                "REVIEW_REQUIRED";


            let reason =
                "Testing is incomplete.";


            if (
                session.status ===
                "completed"
            ) {

                overallResult =
                    session.overallResult ===
                    "pass"

                        ? "PASS"

                        : session.overallResult ===
                            "fail"

                            ? "FAIL"

                            : "REVIEW_REQUIRED";


                reason =
                    overallResult ===
                    "PASS"

                        ? "All applicable tests passed."

                        : overallResult ===
                            "FAIL"

                            ? "One or more applicable tests failed."

                            : "Evaluation requires review.";

            }

            else if (
                allTestsComplete
            ) {

                overallResult =
                    failedTests > 0
                        ? "FAIL"
                        : "PASS";


                reason =
                    failedTests > 0

                        ? "One or more applicable tests failed; final evaluation is ready."

                        : "All applicable tests are complete; final evaluation is ready.";

            }


            const orderedResults =
                applicableTests.map(
                    test => {

                        const found =
                            results.find(
                                result =>
                                    result.testCode ===
                                    test.code
                            );


                        return {

                            id:
                                found?._id ||
                                null,

                            testCode:
                                test.code,

                            testName:
                                test.name,

                            complianceStatus:
                                found

                                    ? normalizeStatus(
                                        found.complianceStatus
                                    )

                                    : "PENDING",

                            calculation:
                                found?.calculation ||
                                null,

                            observation:
                                found?.observation ||
                                null,

                            rawObservations:
                                found?.rawObservations ||
                                null,

                            recordedAt:
                                found?.recordedAt ||
                                null,

                            updatedAt:
                                found?.updatedAt ||
                                null

                        };

                    }
                );


            return res.json({

                success: true,

                data: {

                    sessionId:
                        session._id,

                    sessionNumber:
                        session.sessionNumber,

                    status:
                        session.status,

                    overallResult,

                    reason,

                    totalTests:
                        applicableTests.length,

                    completedTests,

                    passedTests,

                    failedTests,

                    reviewRequiredTests:
                        applicableTests.length -
                        completedTests,

                    allTestsComplete,

                    nextTest:
                        allTestsComplete
                            ? null
                            : applicableTests[
                                completedTests
                            ],

                    results:
                        orderedResults

                }

            });

        }

        catch (error) {

            console.error(
                "getSessionCompliance error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to load session progress."

            });

        }

    };


// ==========================================================
// FINAL EVALUATION
// ==========================================================

// ==========================================================
// FINALIZE TEST SESSION
// ==========================================================

const finalizeTestSession = async (
    req,
    res
) => {

    try {

        const {
            sessionId
        } = req.params;


        const session =
            await TestSession.findById(
                sessionId
            );


        if (!session) {

            return res.status(404).json({

                success: false,

                message:
                    "Test session not found."

            });

        }


        // --------------------------------------------------
        // GET ALL SAVED RESULTS
        // --------------------------------------------------

        const results =
            await TestResult.collection
                .find({
                    testSession:
                        session._id
                })
                .toArray();


        // --------------------------------------------------
        // GET APPLICABLE TESTS
        // --------------------------------------------------

        const applicableTests =
            (session.applicableTests || [])
                .filter(
                    test =>
                        test.status !==
                        "not_applicable"
                );


        const totalTests =
            applicableTests.length;


        // --------------------------------------------------
        // COUNT RESULTS
        // --------------------------------------------------

        const passedTests =
            results.filter(
                result =>
                    String(
                        result.complianceStatus
                    ).toUpperCase() ===
                    "PASS"
            ).length;


        const failedTests =
            results.filter(
                result =>
                    String(
                        result.complianceStatus
                    ).toUpperCase() ===
                    "FAIL"
            ).length;


        const completedTests =
            passedTests +
            failedTests;


        // --------------------------------------------------
        // MAKE SURE EVERY TEST IS COMPLETE
        // --------------------------------------------------

        if (
            totalTests === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No applicable tests were found."

            });

        }


        if (
            completedTests <
            totalTests
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All applicable tests must be completed before final evaluation.",

                data: {

                    totalTests,

                    completedTests,

                    passedTests,

                    failedTests

                }

            });

        }


        // --------------------------------------------------
        // FINAL OVERALL RESULT
        // --------------------------------------------------

        const overallResult =
            failedTests > 0
                ? "fail"
                : "pass";


        const reason =
            failedTests > 0
                ? "One or more applicable tests failed."
                : "All applicable tests passed.";


        // --------------------------------------------------
        // UPDATE SESSION
        // --------------------------------------------------

        const updatedSession =
            await TestSession.findByIdAndUpdate(

                session._id,

                {

                    overallResult,

                    status:
                        "completed"

                },

                {

                    new: true

                }

            );


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        return res.json({

            success: true,

            message:
                "Test session finalized successfully.",

            data: {

                sessionId:
                    updatedSession._id,

                status:
                    updatedSession.status,

                overallResult:
                    overallResult.toUpperCase(),

                reason,

                totalTests,

                completedTests,

                passedTests,

                failedTests

            }

        });

    }
    catch (error) {

        console.error(
            "finalizeTestSession:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to finalize test session."

        });

    }

};


// ==========================================================
// EXPORT CONTROLLERS
// ==========================================================

module.exports = {

    recordTestResult,

    getSessionCompliance,

    finalizeTestSession

};