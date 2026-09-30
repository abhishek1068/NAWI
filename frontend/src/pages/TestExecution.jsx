import React, {
    useEffect,
    useState
} from "react";

import {
    getTestPlan,
    calculateIndication,
    calculateRepeatability
} from "../services/api";


const API_BASE =
    "http://localhost:5100";



function TestExecution({
    instrument,
    session,
    onComplete
}) {


    const [
        testPlan,
        setTestPlan
    ] = useState([]);


    const [
        selectedTest,
        setSelectedTest
    ] = useState(null);


    const [
        referenceLoad,
        setReferenceLoad
    ] = useState("");


    const [
        indicatedValue,
        setIndicatedValue
    ] = useState("");


    const [
        readings,
        setReadings
    ] = useState([
        "",
        "",
        ""
    ]);


    const [
        result,
        setResult
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        calculating,
        setCalculating
    ] = useState(false);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        saved,
        setSaved
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");



    // ========================================================
    // LOAD TEST PLAN
    // ========================================================

    useEffect(() => {

        loadTestPlan();

    }, [session?.id]);



    const loadTestPlan = async () => {

        try {

            setLoading(true);
            setError("");


            if (!session?.id) {

                throw new Error(
                    "Test session ID is missing"
                );

            }


            const response =
                await getTestPlan(
                    session.id
                );


            const tests =
                response.data.testPlan
                    ?.filter(
                        test =>
                            test.applicable !== false &&
                            test.status !==
                                "not_applicable"
                    ) ||
                [];


            setTestPlan(
                tests
            );


            const indication =
                tests.find(
                    test =>
                        test.code ===
                        "INDICATION_ERROR"
                );


            setSelectedTest(
                indication ||
                tests[0] ||
                null
            );


        }
        catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load test plan"
            );

        }
        finally {

            setLoading(false);

        }

    };



    // ========================================================
    // SELECT TEST
    // ========================================================

    const selectTest = (
        test
    ) => {

        setSelectedTest(
            test
        );

        setResult(
            null
        );

        setSaved(
            false
        );

        setError("");

    };



    // ========================================================
    // REPEATABILITY READINGS
    // ========================================================

    const updateReading = (
        index,
        value
    ) => {

        const updated = [
            ...readings
        ];

        updated[index] =
            value;

        setReadings(
            updated
        );

    };



    const addReading = () => {

        setReadings([
            ...readings,
            ""
        ]);

    };



    const removeReading = (
        index
    ) => {

        if (
            readings.length <= 2
        ) {
            return;
        }


        setReadings(
            readings.filter(
                (_, i) =>
                    i !== index
            )
        );

    };



    // ========================================================
    // SAVE RESULT TO MONGODB
    // ========================================================

    const persistTestResult = async ({
        calculationResult,
        observation,
        rawObservations
    }) => {

        if (!session?.id) {

            throw new Error(
                "Test session ID is missing"
            );

        }


        if (!selectedTest?.code) {

            throw new Error(
                "Test code is missing"
            );

        }


        setSaving(true);
        setSaved(false);


        try {

            const response =
                await fetch(
                    `${API_BASE}/api/test-results/record`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                sessionId:
                                    session.id,

                                testCode:
                                    selectedTest.code,

                                testName:
                                    selectedTest.name ||
                                    selectedTest.code,

                                calculationResult:
                                    calculationResult,

                                observation:
                                    observation ||
                                    {},

                                rawObservations:
                                    rawObservations ||
                                    {}

                            })

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
                    "Unable to save test result"
                );

            }


            setSaved(
                true
            );


            return data;

        }
        finally {

            setSaving(
                false
            );

        }

    };



    // ========================================================
    // INDICATION ERROR
    // ========================================================

    const runIndicationCalculation =
        async () => {

            setError("");
            setResult(null);
            setSaved(false);
            setCalculating(true);


            try {

                if (
                    referenceLoad === "" ||
                    indicatedValue === ""
                ) {

                    throw new Error(
                        "Enter both reference load and indicated value"
                    );

                }


                const response =
                    await calculateIndication(
                        session.id,
                        {

                            referenceLoad:
                                Number(
                                    referenceLoad
                                ),

                            indicatedValue:
                                Number(
                                    indicatedValue
                                ),

                            mode:
                                "initial"

                        }
                    );


                const calculation =
                    response.data;


                setResult(
                    calculation
                );


                await persistTestResult({

                    calculationResult:
                        calculation,

                    observation: {

                        referenceLoad:
                            Number(
                                referenceLoad
                            ),

                        indicatedValue:
                            Number(
                                indicatedValue
                            )

                    },

                    rawObservations: {

                        referenceLoad:
                            Number(
                                referenceLoad
                            ),

                        indicatedValue:
                            Number(
                                indicatedValue
                            )

                    }

                });


            }
            catch (err) {

                console.error(
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Calculation or save failed"
                );

            }
            finally {

                setCalculating(
                    false
                );

            }

        };



    // ========================================================
    // REPEATABILITY
    // ========================================================

    const runRepeatabilityCalculation =
        async () => {

            setError("");
            setResult(null);
            setSaved(false);
            setCalculating(true);


            try {

                const numericReadings =
                    readings
                        .filter(
                            value =>
                                value !== ""
                        )
                        .map(
                            Number
                        );


                if (
                    numericReadings.length <
                    2
                ) {

                    throw new Error(
                        "Enter at least two readings"
                    );

                }


                if (
                    referenceLoad === ""
                ) {

                    throw new Error(
                        "Enter the reference load"
                    );

                }


                const response =
                    await calculateRepeatability(
                        session.id,
                        {

                            readings:
                                numericReadings,

                            referenceLoad:
                                Number(
                                    referenceLoad
                                ),

                            mode:
                                "initial"

                        }
                    );


                const calculation =
                    response.data;


                setResult(
                    calculation
                );


                await persistTestResult({

                    calculationResult:
                        calculation,

                    observation: {

                        referenceLoad:
                            Number(
                                referenceLoad
                            ),

                        readings:
                            numericReadings

                    },

                    rawObservations: {

                        referenceLoad:
                            Number(
                                referenceLoad
                            ),

                        readings:
                            numericReadings

                    }

                });


            }
            catch (err) {

                console.error(
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Calculation or save failed"
                );

            }
            finally {

                setCalculating(
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

                    Loading test session...

                </div>

            </div>

        );

    }



    // ========================================================
    // ERROR WITHOUT TEST PLAN
    // ========================================================

    if (
        error &&
        !selectedTest
    ) {

        return (

            <div className="page">

                <div className="error-banner">

                    {error}

                </div>

            </div>

        );

    }



    // ========================================================
    // MAIN PAGE
    // ========================================================

    return (

        <div className="page">


            <div className="page-header">

                <div>

                    <div className="eyebrow">

                        STEP 03 / GUIDED TESTING

                    </div>


                    <h1>

                        Test Execution

                    </h1>


                    <p>

                        Enter observations and let
                        the deterministic calculation
                        engine evaluate compliance.

                    </p>

                </div>


                <div className="standard-chip">

                    R76:2006

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
                        CLASS
                    </span>

                    <strong>

                        Class{" "}
                        {instrument?.accuracyClass}

                    </strong>

                </div>


                <div>

                    <span>
                        e
                    </span>

                    <strong>

                        {instrument?.verificationScaleInterval}{" "}
                        {instrument?.unit}

                    </strong>

                </div>


            </div>



            {/* =================================================
                TESTING LAYOUT
            ================================================= */}

            <div className="testing-layout">


                {/* =================================================
                    TEST SIDEBAR
                ================================================= */}

                <div className="testing-sidebar">


                    <div className="test-sidebar-title">

                        TEST PLAN

                    </div>


                    {testPlan.map(
                        (test, index) => (

                            <button
                                key={
                                    test.code
                                }

                                type="button"

                                className={
                                    `test-sidebar-item ${
                                        selectedTest?.code ===
                                        test.code
                                            ? "active"
                                            : ""
                                    }`
                                }

                                onClick={() =>
                                    selectTest(
                                        test
                                    )
                                }
                            >

                                <span>

                                    {String(
                                        index + 1
                                    ).padStart(
                                        2,
                                        "0"
                                    )}

                                </span>


                                <div>

                                    <strong>

                                        {
                                            test.name ||
                                            test.code
                                        }

                                    </strong>

                                    <small>

                                        {
                                            test.code
                                        }

                                    </small>

                                </div>

                            </button>

                        )
                    )}

                </div>



                {/* =================================================
                    TEST CONTENT
                ================================================= */}

                <div className="testing-content">


                    {selectedTest && (

                        <>

                            <div className="test-content-header">

                                <div>

                                    <div className="eyebrow">

                                        SELECTED TEST

                                    </div>

                                    <h2>

                                        {
                                            selectedTest.name ||
                                            selectedTest.code
                                        }

                                    </h2>

                                    <p>

                                        Test code:
                                        {" "}
                                        {
                                            selectedTest.code
                                        }

                                    </p>

                                </div>


                                <div className="test-status-badge">

                                    APPLICABLE

                                </div>

                            </div>



                            {/* =================================================
                                INDICATION ERROR
                            ================================================= */}

                            {selectedTest.code ===
                                "INDICATION_ERROR" && (

                                <div className="test-form-card">


                                    <div className="form-field">

                                        <label>

                                            Reference Load

                                        </label>

                                        <input
                                            type="number"
                                            step="any"
                                            value={
                                                referenceLoad
                                            }
                                            onChange={
                                                event =>
                                                    setReferenceLoad(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Enter reference load"
                                        />

                                    </div>



                                    <div className="form-field">

                                        <label>

                                            Indicated Value

                                        </label>

                                        <input
                                            type="number"
                                            step="any"
                                            value={
                                                indicatedValue
                                            }
                                            onChange={
                                                event =>
                                                    setIndicatedValue(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Enter indication"
                                        />

                                    </div>



                                    <div className="calculation-note">

                                        <strong>

                                            Automatic R76 calculation

                                        </strong>

                                        <small>

                                            MPE is determined from
                                            accuracy class, verification
                                            scale interval and test load.

                                        </small>

                                    </div>



                                    <button
                                        type="button"
                                        className="primary-button large"
                                        onClick={
                                            runIndicationCalculation
                                        }
                                        disabled={
                                            calculating ||
                                            saving
                                        }
                                    >

                                        {calculating
                                            ? "Calculating..."
                                            : saving
                                                ? "Saving..."
                                                : "Calculate & Save →"}

                                    </button>


                                </div>

                            )}



                            {/* =================================================
                                REPEATABILITY
                            ================================================= */}

                            {selectedTest.code ===
                                "REPEATABILITY" && (

                                <div className="test-form-card">


                                    <div className="form-field">

                                        <label>

                                            Reference Load

                                        </label>

                                        <input
                                            type="number"
                                            step="any"
                                            value={
                                                referenceLoad
                                            }
                                            onChange={
                                                event =>
                                                    setReferenceLoad(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Enter test load"
                                        />

                                    </div>



                                    <div className="repeatability-header">

                                        <label>

                                            Repeated Readings

                                        </label>


                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                addReading
                                            }
                                        >

                                            + Add Reading

                                        </button>

                                    </div>



                                    <div className="repeatability-list">

                                        {readings.map(
                                            (
                                                reading,
                                                index
                                            ) => (

                                                <div
                                                    className="reading-row"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <span>

                                                        {index + 1}

                                                    </span>


                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={
                                                            reading
                                                        }
                                                        onChange={
                                                            event =>
                                                                updateReading(
                                                                    index,
                                                                    event.target.value
                                                                )
                                                        }
                                                        placeholder={
                                                            `Reading ${
                                                                index + 1
                                                            }`
                                                        }
                                                    />


                                                    {readings.length >
                                                        2 && (

                                                        <button
                                                            type="button"
                                                            className="remove-button"
                                                            onClick={() =>
                                                                removeReading(
                                                                    index
                                                                )
                                                            }
                                                        >

                                                            ×

                                                        </button>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>



                                    <div className="calculation-note">

                                        <strong>

                                            Repeatability rule

                                        </strong>

                                        <small>

                                            The difference between
                                            repeated weighings is
                                            evaluated against the
                                            applicable R76 permissible
                                            error.

                                        </small>

                                    </div>



                                    <button
                                        type="button"
                                        className="primary-button large"
                                        onClick={
                                            runRepeatabilityCalculation
                                        }
                                        disabled={
                                            calculating ||
                                            saving
                                        }
                                    >

                                        {calculating
                                            ? "Calculating..."
                                            : saving
                                                ? "Saving..."
                                                : "Calculate & Save →"}

                                    </button>


                                </div>

                            )}



                            {/* =================================================
                                OTHER TESTS
                            ================================================= */}

                            {selectedTest.code !==
                                "INDICATION_ERROR" &&
                                selectedTest.code !==
                                "REPEATABILITY" && (

                                <div className="unsupported-test">

                                    <div className="intelligence-icon">

                                        i

                                    </div>

                                    <div>

                                        <strong>

                                            Guided observation form

                                        </strong>

                                        <span>

                                            This test is included
                                            in the personalized
                                            R76 test plan. Its
                                            dedicated observation
                                            and calculation module
                                            will be handled by the
                                            corresponding test
                                            workflow.

                                        </span>

                                    </div>

                                </div>

                            )}



                            {/* =================================================
                                SAVE STATUS
                            ================================================= */}

                            {saved && (

                                <div className="success-banner">

                                    ✓ Test result saved to
                                    MongoDB successfully.

                                </div>

                            )}



                            {error && (

                                <div className="error-banner">

                                    {error}

                                </div>

                            )}



                            {/* =================================================
                                CALCULATION RESULT
                            ================================================= */}

                            {result && (

                                <div className="calculation-result">


                                    <div className="result-header">

                                        <div>

                                            <span>

                                                CALCULATION RESULT

                                            </span>

                                            <h3>

                                                {
                                                    result.result
                                                        ?.calculationId ||
                                                    result.calculationId ||
                                                    "CALCULATION"
                                                }

                                            </h3>

                                        </div>


                                        <div
                                            className={
                                                `result-pill ${
                                                    (
                                                        result.result
                                                            ?.compliance ||
                                                        result.complianceStatus
                                                    ) ===
                                                    "PASS"
                                                        ? "pass"
                                                        :
                                                        (
                                                            result.result
                                                                ?.compliance ||
                                                            result.complianceStatus
                                                        ) ===
                                                        "FAIL"
                                                            ? "fail"
                                                            : "review"
                                                }`
                                            }
                                        >

                                            {
                                                result.result
                                                    ?.compliance ||
                                                result.complianceStatus ||
                                                "REVIEW_REQUIRED"
                                            }

                                        </div>

                                    </div>



                                    <div className="result-grid">


                                        <div>

                                            <span>
                                                OBSERVED ERROR
                                            </span>

                                            <strong>

                                                {
                                                    result.result
                                                        ?.observedError ??
                                                    result.result
                                                        ?.difference ??
                                                    "—"
                                                }{" "}

                                                {
                                                    instrument?.unit
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                PERMISSIBLE ERROR
                                            </span>

                                            <strong>

                                                ±
                                                {" "}

                                                {
                                                    result.result
                                                        ?.permissibleError ??
                                                    result.result
                                                        ?.mpe ??
                                                    "—"
                                                }{" "}

                                                {
                                                    instrument?.unit
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                OVERALL SESSION
                                            </span>

                                            <strong>

                                                {
                                                    result.overallCompliance
                                                        ?.overallResult ||
                                                    "UPDATED"
                                                }

                                            </strong>

                                        </div>


                                    </div>


                                </div>

                            )}

                        </>

                    )}


                </div>

            </div>



            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="testing-footer">

                <div>

                    <strong>

                        Traceability

                    </strong>

                    <span>

                        Every calculation is persisted
                        against the test session and
                        can be retrieved from the
                        compliance page.

                    </span>

                </div>


                <button
                    type="button"
                    className="primary-button"
                    onClick={
                        onComplete
                    }
                >

                    View Results →

                </button>

            </div>


        </div>

    );

}


export default TestExecution;