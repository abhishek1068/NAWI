const TestSession = require("../models/TestSession");
const TestResult = require("../models/TestResult");


// ==========================================================
// SAVE / UPDATE ONE TEST RESULT
// ==========================================================

const recordTestResult = async (req, res) => {

    try {

        const {
            sessionId,
            testCode,
            testName,
            complianceStatus,
            observation,
            calculation,
            rawObservations
        } = req.body;


        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }


        if (!testCode) {
            return res.status(400).json({
                success: false,
                message: "Test code is required"
            });
        }


        const session =
            await TestSession.findById(sessionId);


        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Test session not found"
            });
        }


        const status =
            String(
                complianceStatus ||
                "REVIEW_REQUIRED"
            ).toUpperCase();


        /*
         * Use the native MongoDB collection here.
         *
         * This makes this persistence layer tolerant
         * of the existing TestResult schema while keeping
         * the compliance data traceable.
         */

        await TestResult.collection.updateOne(

            {
                testSession: session._id,
                testCode: testCode
            },

            {
                $set: {

                    testSession:
                        session._id,

                    testCode,

                    testName:
                        testName || testCode,

                    complianceStatus:
                        status,

                    observation:
                        observation || "",

                    calculation:
                        calculation || null,

                    rawObservations:
                        rawObservations || null,

                    recordedAt:
                        new Date(),

                    updatedAt:
                        new Date()

                },

                $setOnInsert: {

                    createdAt:
                        new Date()

                }

            },

            {
                upsert: true
            }

        );


        // --------------------------------------------------
        // REBUILD SESSION COMPLIANCE
        // --------------------------------------------------

        const savedResults =
            await TestResult.collection
                .find({
                    testSession:
                        session._id
                })
                .toArray();


        const applicableTests =
            (session.applicableTests || [])
                .filter(
                    test =>
                        test.status !==
                        "not_applicable"
                );


        const totalTests =
            applicableTests.length;


        const passedTests =
            savedResults.filter(
                result =>
                    String(
                        result.complianceStatus
                    ).toUpperCase() ===
                    "PASS"
            ).length;


        const failedTests =
            savedResults.filter(
                result =>
                    String(
                        result.complianceStatus
                    ).toUpperCase() ===
                    "FAIL"
            ).length;


        const reviewRequiredTests =
            savedResults.filter(
                result =>
                    ![
                        "PASS",
                        "FAIL"
                    ].includes(
                        String(
                            result.complianceStatus
                        ).toUpperCase()
                    )
            ).length;


        const completedTests =
            passedTests +
            failedTests;


        let overallResult =
            "review_required";


        let reason =
            "One or more applicable tests require completion or review.";


        if (
            failedTests > 0
        ) {

            overallResult =
                "fail";

            reason =
                "One or more applicable tests failed.";

        }
        else if (
            totalTests > 0 &&
            completedTests >= totalTests &&
            reviewRequiredTests === 0
        ) {

            overallResult =
                "pass";

            reason =
                "All applicable tests passed.";

        }


        await TestSession.findByIdAndUpdate(

            session._id,

            {

                overallResult,

                status:
                    overallResult === "pass" ||
                    overallResult === "fail"
                        ? "completed"
                        : "testing"

            },

            {
                new: true
            }

        );


        return res.json({

            success: true,

            message:
                "Test result recorded successfully.",

            data: {

                sessionId:
                    session._id,

                testCode,

                complianceStatus:
                    status,

                overallResult:
                    overallResult
                        .toUpperCase(),

                totalTests,

                completedTests,

                passedTests,

                failedTests,

                reviewRequiredTests,

                reason

            }

        });

    }
    catch (error) {

        console.error(
            "recordTestResult:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to record test result."

        });

    }

};


// ==========================================================
// GET LIVE SESSION COMPLIANCE
// ==========================================================

const getSessionCompliance = async (
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


        const results =
            await TestResult.collection
                .find({
                    testSession:
                        session._id
                })
                .sort({
                    updatedAt: -1
                })
                .toArray();


        const applicableTests =
            (session.applicableTests || [])
                .filter(
                    test =>
                        test.status !==
                        "not_applicable"
                );


        const totalTests =
            applicableTests.length;


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


        const reviewRequiredTests =
            results.filter(
                result =>
                    ![
                        "PASS",
                        "FAIL"
                    ].includes(
                        String(
                            result.complianceStatus
                        ).toUpperCase()
                    )
            ).length;


        const completedTests =
            passedTests +
            failedTests;


        let overallResult =
            "REVIEW_REQUIRED";


        let reason =
            "One or more applicable tests require completion or review.";


        if (
            failedTests > 0
        ) {

            overallResult =
                "FAIL";

            reason =
                "One or more applicable tests failed.";

        }
        else if (
            totalTests > 0 &&
            completedTests >= totalTests &&
            reviewRequiredTests === 0
        ) {

            overallResult =
                "PASS";

            reason =
                "All applicable tests passed.";

        }


        return res.json({

            success: true,

            data: {

                overallResult,

                reason,

                totalTests,

                completedTests,

                passedTests,

                failedTests,

                reviewRequiredTests,

                results

            }

        });

    }
    catch (error) {

        console.error(
            "getSessionCompliance:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load compliance."

        });

    }

};


module.exports = {

    recordTestResult,

    getSessionCompliance

};