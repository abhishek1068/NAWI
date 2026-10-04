import React, {
    useEffect,
    useState
} from "react";

import {
    generateReport
} from "../services/api";


const API_BASE =
    "http://localhost:5100";



function TestResults({
    instrument,
    session
}) {


    const [
        compliance,
        setCompliance
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        generating,
        setGenerating
    ] = useState(false);



    // ========================================================
    // LOAD LIVE COMPLIANCE
    // ========================================================

    const loadCompliance =
        async () => {

            try {

                setLoading(
                    true
                );

                setError("");


                if (
                    !session?.id
                ) {

                    throw new Error(
                        "Test session ID is missing."
                    );

                }


                const response =
                    await fetch(
                        `${API_BASE}/api/test-results/session/${session.id}/compliance`,
                        {
                            cache:
                                "no-store"
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load compliance."
                    );

                }


                setCompliance(
                    data.data
                );


            }
            catch (err) {

                console.error(
                    err
                );

                setError(
                    err.message ||
                    "Unable to load compliance."
                );

            }
            finally {

                setLoading(
                    false
                );

            }

        };



    // ========================================================
    // LOAD WHEN SESSION CHANGES
    // ========================================================

    useEffect(
        () => {

            loadCompliance();

        },
        [session?.id]
    );



    // ========================================================
    // GENERATE REPORT
    // ========================================================

    const createReport =
    async () => {

        let pdfWindow = null;

        try {

            setGenerating(
                true
            );

            setError("");


            if (
                !session?.id
            ) {

                throw new Error(
                    "Test session ID is missing."
                );

            }


            /*
            --------------------------------------------------
            Open a blank tab immediately so the browser does
            not block the PDF window after the API call.
            --------------------------------------------------
            */

            pdfWindow =
                window.open(
                    "about:blank",
                    "_blank"
                );


            /*
            --------------------------------------------------
            Generate PDF + DOCX on backend
            --------------------------------------------------
            */

            const response =
                await generateReport(
                    session.id
                );


            const pdfPath =
                response
                    ?.data
                    ?.files
                    ?.pdf
                    ?.path;


            const pdfFileName =
                response
                    ?.data
                    ?.files
                    ?.pdf
                    ?.fileName;


            const docxPath =
                response
                    ?.data
                    ?.files
                    ?.docx
                    ?.path;


            const docxFileName =
                response
                    ?.data
                    ?.files
                    ?.docx
                    ?.fileName;


            if (
                !pdfPath
            ) {

                throw new Error(
                    "Report was generated but the PDF file path was not returned by the server."
                );

            }


            /*
            --------------------------------------------------
            PDF
            --------------------------------------------------
            */

            const pdfUrl =
                `${API_BASE}${pdfPath}`;


            if (
                pdfWindow
            ) {

                pdfWindow.location.href =
                    pdfUrl;

            }
            else {

                window.open(
                    pdfUrl,
                    "_blank"
                );

            }


            /*
            --------------------------------------------------
            DOCX
            --------------------------------------------------
            */

            if (
                docxPath
            ) {

                const docxUrl =
                    `${API_BASE}${docxPath}`;


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    docxUrl;


                link.download =
                    docxFileName ||
                    "NAWI-SmartLab-Test-Report.docx";


                document.body.appendChild(
                    link
                );


                link.click();


                document.body.removeChild(
                    link
                );

            }


            /*
            --------------------------------------------------
            Success message
            --------------------------------------------------
            */

            setError(
                ""
            );


        }
        catch (err) {

            console.error(
                "Report generation error:",
                err
            );


            if (
                pdfWindow &&
                !pdfWindow.closed
            ) {

                pdfWindow.close();

            }


            setError(
                err.response
                    ?.data
                    ?.message ||
                err.message ||
                "Report generation failed."
            );

        }
        finally {

            setGenerating(
                false
            );

        }

    };



    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="page">

                <div className="loading-state">

                    Reading latest MongoDB test results...

                </div>

            </div>

        );

    }



    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (

            <div className="page">

                <div className="error-banner">

                    {error}

                </div>


                <button
                    className="primary-button"
                    onClick={
                        loadCompliance
                    }
                >

                    Retry

                </button>

            </div>

        );

    }



    const result =
        compliance?.overallResult ||
        "REVIEW_REQUIRED";


    const resultClass =
        result === "PASS"
            ? "pass"
            : result === "FAIL"
                ? "fail"
                : "review";



    return (

        <div className="page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <div className="eyebrow">

                        STEP 04 / DECISION

                    </div>


                    <h1>

                        Results & Report

                    </h1>


                    <p>

                        Live compliance status from
                        the results currently stored
                        for this test session.

                    </p>

                </div>


                <div className="standard-chip">

                    OIML R76:2006

                </div>

            </div>



            {/* =================================================
                INSTRUMENT SUMMARY
            ================================================= */}

            <div className="instrument-summary">


                <div>

                    <span>
                        INSTRUMENT
                    </span>

                    <strong>

                        {instrument?.manufacturer}{" "}

                        {instrument?.model}

                    </strong>

                </div>


                <div>

                    <span>
                        SERIAL NUMBER
                    </span>

                    <strong>

                        {instrument?.serialNumber}

                    </strong>

                </div>


                <div>

                    <span>
                        SESSION
                    </span>

                    <strong>

                        {
                            compliance?.sessionNumber ||
                            session?.sessionNumber ||
                            session?.id
                        }

                    </strong>

                </div>


                <div>

                    <span>
                        STANDARD
                    </span>

                    <strong>

                        R76:2006

                    </strong>

                </div>


            </div>



            {/* =================================================
                OVERALL COMPLIANCE
            ================================================= */}

            <div
                className={
                    `compliance-hero ${resultClass}`
                }
            >

                <div className="compliance-icon">

                    {
                        result === "PASS"
                            ? "✓"
                            : result === "FAIL"
                                ? "×"
                                : "?"
                    }

                </div>


                <div>

                    <span>
                        OVERALL COMPLIANCE
                    </span>


                    <h2>

                        {result}

                    </h2>


                    <p>

                        {
                            compliance?.reason ||
                            "Testing is incomplete"
                        }

                    </p>

                </div>

            </div>



            {/* =================================================
                LIVE STATS
            ================================================= */}

            <div className="results-stat-grid">


                <div className="result-stat">

                    <span>
                        APPLICABLE TESTS
                    </span>

                    <strong>

                        {
                            compliance?.totalTests ||
                            0
                        }

                    </strong>

                </div>


                <div className="result-stat">

                    <span>
                        COMPLETED
                    </span>

                    <strong>

                        {
                            compliance?.completedTests ||
                            0
                        }

                    </strong>

                </div>


                <div className="result-stat pass-stat">

                    <span>
                        PASSED
                    </span>

                    <strong>

                        {
                            compliance?.passedTests ||
                            0
                        }

                    </strong>

                </div>


                <div className="result-stat fail-stat">

                    <span>
                        FAILED
                    </span>

                    <strong>

                        {
                            compliance?.failedTests ||
                            0
                        }

                    </strong>

                </div>


                <div className="result-stat review-stat">

                    <span>
                        REVIEW REQUIRED
                    </span>

                    <strong>

                        {
                            compliance?.reviewRequiredTests ||
                            0
                        }

                    </strong>

                </div>


            </div>



            {/* =================================================
                TEST BREAKDOWN
            ================================================= */}

            <div className="results-section">


                <div className="section-heading">

                    <div>

                        <h2>
                            Test Breakdown
                        </h2>

                        <p>

                            These are the latest
                            persisted test results
                            retrieved directly
                            from MongoDB.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            loadCompliance
                        }
                    >

                        ↻ Refresh Results

                    </button>

                </div>



                <div className="test-result-list">

                    {
                        (
                            compliance?.results ||
                            []
                        ).length === 0 ? (

                            <div className="empty-state">

                                No test results have
                                been saved yet.

                            </div>

                        ) : (

                            (
                                compliance?.results ||
                                []
                            ).map(
                                resultItem => {

                                    const status =
                                        String(
                                            resultItem.complianceStatus ||
                                            "REVIEW_REQUIRED"
                                        ).toUpperCase();


                                    return (

                                        <div
                                            className="test-result-row"
                                            key={
                                                resultItem.testCode
                                            }
                                        >

                                            <div>

                                                <strong>

                                                    {
                                                        resultItem.testName ||
                                                        resultItem.testCode
                                                    }

                                                </strong>


                                                <small>

                                                    {
                                                        resultItem.testCode
                                                    }

                                                </small>

                                            </div>


                                            <span
                                                className={
                                                    `result-pill ${
                                                        status === "PASS"
                                                            ? "pass"
                                                            : status === "FAIL"
                                                                ? "fail"
                                                                : "review"
                                                    }`
                                                }
                                            >

                                                {status}

                                            </span>

                                        </div>

                                    );

                                }
                            )

                        )
                    }

                </div>

            </div>



            {/* =================================================
                REPORT
            ================================================= */}

            <div className="report-card">


                <div>

                    <strong>

                        Generate Test Report

                    </strong>


                    <span>

                        Create the standardized
                        PDF + editable DOCX report
                        using the persisted test
                        session data.

                    </span>

                </div>


                <button
                    className="primary-button"
                    onClick={
                        createReport
                    }
                    disabled={
                        generating
                    }
                >

                    {
                        generating
                            ? "Generating..."
                            : "Generate PDF + DOCX"
                    }

                </button>


            </div>


        </div>

    );

}


export default TestResults;