
import React, { useEffect, useMemo, useState } from "react";

import {
    getTestPlan,
    getSessionCompliance,
    calculateIndication,
    calculateRepeatability,
    recordTestResult,
    finalizeTestSession
} from "../services/api";

function TestExecution({
    instrument,
    session,
    onComplete
}) {
    const [testPlan, setTestPlan] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedCodes, setCompletedCodes] = useState({});
    const [form, setForm] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");
    const [finalizing, setFinalizing] = useState(false);

    const currentTest = testPlan[currentIndex] || null;
    const isLastTest =
        testPlan.length > 0 &&
        currentIndex === testPlan.length - 1;

    const setField = (name, value) => {
        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setForm({});
        setResult(null);
        setError("");
    };

    useEffect(() => {
        loadWorkflow();
    }, [session?.id]);

    useEffect(() => {
        resetForm();
    }, [currentIndex]);

    const loadWorkflow = async () => {
        try {
            setLoading(true);
            setError("");

            if (!session?.id) {
                throw new Error("Test session ID is missing.");
            }

            const planResponse =
                await getTestPlan(session.id);

            const tests =
                (planResponse.data.testPlan || [])
                    .filter(test =>
                        test.applicable !== false &&
                        test.status !== "not_applicable"
                    );

            const complianceResponse =
                await getSessionCompliance(session.id);

            const savedResults =
                complianceResponse.data.data?.results ||
                [];

            const completed = {};

            savedResults.forEach(item => {
                const status =
                    String(
                        item.complianceStatus || ""
                    ).toUpperCase();

                if (
                    status === "PASS" ||
                    status === "FAIL"
                ) {
                    completed[item.testCode] = status;
                }
            });

            const firstIncomplete =
                tests.findIndex(
                    test => !completed[test.code]
                );

            setTestPlan(tests);
            setCompletedCodes(completed);

            setCurrentIndex(
                firstIncomplete === -1
                    ? Math.max(tests.length - 1, 0)
                    : firstIncomplete
            );

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load test workflow."
            );
        } finally {
            setLoading(false);
        }
    };

    const goToNextTest = () => {
        if (!currentTest) {
            return;
        }

        if (!completedCodes[currentTest.code]) {
            setError(
                "Complete the current test before continuing."
            );
            return;
        }

        if (!isLastTest) {
            setCurrentIndex(index => index + 1);
        }
    };

    const saveGenericTest = async (
        complianceStatus,
        observation,
        explanation,
        ruleBasis
    ) => {
        if (!currentTest) {
            return;
        }

        setWorking(true);
        setError("");
        setResult(null);

        try {
            const response =
                await recordTestResult({
                    sessionId: session.id,
                    testCode: currentTest.code,
                    testName: currentTest.name,
                    complianceStatus,
                    observation,
                    calculation: {
                        complianceStatus,
                        explanation,
                        ruleBasis,
                        ruleVersion: "R76-2006"
                    },
                    rawObservations: observation
                });

            setCompletedCodes(previous => ({
                ...previous,
                [currentTest.code]:
                    complianceStatus
            }));

            setResult(
                response.data.data
            );

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save this test."
            );
        } finally {
            setWorking(false);
        }
    };

    const runIndication = async () => {
        if (
            form.referenceLoad === undefined ||
            form.referenceLoad === "" ||
            form.indicatedValue === undefined ||
            form.indicatedValue === ""
        ) {
            setError(
                "Enter both reference load and indicated value."
            );
            return;
        }

        setWorking(true);
        setError("");
        setResult(null);

        try {
            const response =
                await calculateIndication(
                    session.id,
                    {
                        referenceLoad:
                            Number(form.referenceLoad),
                        indicatedValue:
                            Number(form.indicatedValue),
                        mode: "initial"
                    }
                );

            const calculation =
                response.data.result;

            const status =
                calculation.compliance ||
                "REVIEW_REQUIRED";

            const saved =
                await recordTestResult({
                    sessionId: session.id,
                    testCode: currentTest.code,
                    testName: currentTest.name,
                    complianceStatus: status,
                    calculationResult:
                        response.data,
                    calculation: response.data,
                    observation: {
                        referenceLoad:
                            Number(form.referenceLoad),
                        indicatedValue:
                            Number(form.indicatedValue)
                    },
                    rawObservations: {
                        referenceLoad:
                            Number(form.referenceLoad),
                        indicatedValue:
                            Number(form.indicatedValue)
                    }
                });

            setResult({
                ...response.data,
                savedProgress:
                    saved.data.data
            });

            if (
                status === "PASS" ||
                status === "FAIL"
            ) {
                setCompletedCodes(previous => ({
                    ...previous,
                    [currentTest.code]: status
                }));
            }

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Indication calculation failed."
            );
        } finally {
            setWorking(false);
        }
    };

    const runRepeatability = async () => {
        const readings =
            Array.isArray(form.readings)
                ? form.readings
                    .filter(value =>
                        value !== "" &&
                        value !== undefined
                    )
                    .map(Number)
                : [];

        if (readings.length < 2) {
            setError(
                "Enter at least two repeated readings."
            );
            return;
        }

        if (
            form.referenceLoad === undefined ||
            form.referenceLoad === ""
        ) {
            setError(
                "Enter the reference load."
            );
            return;
        }

        setWorking(true);
        setError("");
        setResult(null);

        try {
            const response =
                await calculateRepeatability(
                    session.id,
                    {
                        readings,
                        referenceLoad:
                            Number(form.referenceLoad),
                        mode: "initial"
                    }
                );

            const calculation =
                response.data.result;

            const status =
                calculation.compliance ||
                "REVIEW_REQUIRED";

            const saved =
                await recordTestResult({
                    sessionId: session.id,
                    testCode: currentTest.code,
                    testName: currentTest.name,
                    complianceStatus: status,
                    calculationResult:
                        response.data,
                    calculation: response.data,
                    observation: {
                        referenceLoad:
                            Number(form.referenceLoad),
                        readings
                    },
                    rawObservations: {
                        referenceLoad:
                            Number(form.referenceLoad),
                        readings
                    }
                });

            setResult({
                ...response.data,
                savedProgress:
                    saved.data.data
            });

            if (
                status === "PASS" ||
                status === "FAIL"
            ) {
                setCompletedCodes(previous => ({
                    ...previous,
                    [currentTest.code]: status
                }));
            }

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Repeatability calculation failed."
            );
        } finally {
            setWorking(false);
        }
    };

    const addReading = () => {
        const readings =
            Array.isArray(form.readings)
                ? form.readings
                : ["", "", ""];

        setField("readings", [
            ...readings,
            ""
        ]);
    };

    const updateReading = (
        index,
        value
    ) => {
        const readings =
            Array.isArray(form.readings)
                ? [...form.readings]
                : ["", "", ""];

        readings[index] = value;

        setField("readings", readings);
    };

    const finalize = async () => {
        if (
            !testPlan.length ||
            Object.keys(completedCodes).length <
                testPlan.length
        ) {
            setError(
                "Complete every applicable test before final evaluation."
            );
            return;
        }

        setFinalizing(true);
        setError("");

        try {
            await finalizeTestSession(
                session.id
            );

            onComplete();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to complete evaluation."
            );
        } finally {
            setFinalizing(false);
        }
    };

    const visualFields = [
        ["identification", "Identification / markings"],
        ["construction", "Construction / workmanship"],
        ["display", "Indication / display"],
        ["units", "Units / inscriptions"],
        ["controls", "Operating controls"],
        ["sealing", "Security / sealing"]
    ];

    const visualPass =
        visualFields.every(
            ([key]) =>
                form[key] === "satisfactory"
        );

    const genericDefinitions = useMemo(() => ({
        ZERO_SETTING: {
            title: "Zero-Setting Accuracy",
            basis: "R76-1:2006 §4.5.2",
            fields: [
                ["zeroBefore", "Indication before zero setting", "number"],
                ["zeroAfter", "Indication after zero setting", "number"],
                ["observedDeviation", "Observed zero deviation", "number"]
            ]
        },
        ECCENTRIC_LOADING: {
            title: "Eccentric Loading",
            basis: "R76-1:2006 §3.6.2",
            fields: [
                ["testLoad", "Eccentric test load", "number"],
                ["position1", "Position 1 indication", "number"],
                ["position2", "Position 2 indication", "number"],
                ["position3", "Position 3 indication", "number"],
                ["position4", "Position 4 indication", "number"],
                ["position5", "Position 5 indication", "number"]
            ]
        },
        INFLUENCE_FACTORS: {
            title: "Influence Factor Tests",
            basis: "R76-1:2006 §3.9 / Annex A.5",
            fields: [
                ["environmentalCondition", "Test condition / influence quantity", "text"],
                ["referenceLoad", "Reference load", "number"],
                ["indicatedValue", "Indicated value", "number"],
                ["observedEffect", "Observed effect / deviation", "number"]
            ]
        },
        DISTURBANCES: {
            title: "Disturbance Tests",
            basis: "R76-1:2006 Annex B.3",
            fields: [
                ["disturbanceType", "Disturbance type", "select"],
                ["referenceLoad", "Reference load", "number"],
                ["indicatedValue", "Indicated value during disturbance", "number"],
                ["postTestValue", "Indication after disturbance", "number"]
            ]
        },
        TARE_ACCURACY: {
            title: "Tare Device Accuracy",
            basis: "R76-1:2006 §4.6.3",
            fields: [
                ["tareLoad", "Tare load", "number"],
                ["tareIndication", "Tare indication", "number"],
                ["observedEffect", "Observed tare-setting effect", "number"]
            ]
        },
        DISCRIMINATION: {
            title: "Discrimination",
            basis: "R76-1:2006 §3.8",
            fields: [
                ["load", "Load", "number"],
                ["additionalLoad", "Additional load", "number"],
                ["indicationBefore", "Indication before", "number"],
                ["indicationAfter", "Indication after", "number"]
            ]
        },
        MULTIPLE_INDICATING_DEVICES: {
            title: "Multiple Indicating Devices",
            basis: "R76-1:2006 §3.6.3",
            fields: [
                ["load", "Test load", "number"],
                ["indicationDevice1", "Indication device 1", "number"],
                ["indicationDevice2", "Indication device 2", "number"]
            ]
        },
        TILT: {
            title: "Tilt Test",
            basis: "R76-1:2006 §4.18",
            fields: [
                ["tiltAngle", "Tilt angle", "number"],
                ["referenceLoad", "Reference load", "number"],
                ["indicatedValue", "Indicated value", "number"]
            ]
        }
    }), []);

    const genericDefinition =
        currentTest
            ? genericDefinitions[currentTest.code]
            : null;

    const renderGenericForm = () => {
        if (!currentTest) {
            return null;
        }

        if (
            currentTest.code ===
            "VISUAL_EXAMINATION"
        ) {
            return (
                <div className="test-form-card">
                    <div className="form-section-intro">
                        <strong>Visual examination checklist</strong>
                        <span>
                            Record each examination item before continuing.
                        </span>
                    </div>

                    <div className="measurement-grid">
                        {visualFields.map(
                            ([key, label]) => (
                                <div
                                    className="form-field"
                                    key={key}
                                >
                                    <label>{label}</label>

                                    <select
                                        value={
                                            form[key] || ""
                                        }
                                        onChange={event =>
                                            setField(
                                                key,
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select observation
                                        </option>
                                        <option value="satisfactory">
                                            Satisfactory
                                        </option>
                                        <option value="unsatisfactory">
                                            Unsatisfactory
                                        </option>
                                    </select>
                                </div>
                            )
                        )}
                    </div>

                    <div className="form-field">
                        <label>Remarks</label>
                        <textarea
                            value={form.notes || ""}
                            onChange={event =>
                                setField(
                                    "notes",
                                    event.target.value
                                )
                            }
                            placeholder="Enter visual examination remarks"
                        />
                    </div>

                    <div className="calculation-note">
                        <strong>
                            Evaluation rule
                        </strong>
                        <small>
                            Every checklist item must be satisfactory for this test to pass.
                        </small>
                    </div>

                    <button
                        type="button"
                        className="primary-button large"
                        disabled={
                            working ||
                            !visualFields.every(
                                ([key]) =>
                                    form[key]
                            )
                        }
                        onClick={() =>
                            saveGenericTest(
                                visualPass
                                    ? "PASS"
                                    : "FAIL",
                                form,
                                visualPass
                                    ? "All visual examination checklist items were satisfactory."
                                    : "One or more visual examination checklist items were unsatisfactory.",
                                "R76-1:2006 initial examination / applicable construction and marking requirements"
                            )
                        }
                    >
                        {working
                            ? "Saving..."
                            : "Complete Visual Examination →"}
                    </button>
                </div>
            );
        }

        if (
            currentTest.code ===
            "ZERO_SETTING"
        ) {
            const deviation =
                Number(form.zeroAfter) -
                Number(form.zeroBefore);

            const hasValues =
                form.zeroBefore !== undefined &&
                form.zeroBefore !== "" &&
                form.zeroAfter !== undefined &&
                form.zeroAfter !== "";

            const passes =
                hasValues &&
                Math.abs(deviation) <=
                    0.25 *
                    Number(
                        instrument?.verificationScaleInterval
                    );

            return (
                <div className="test-form-card">
                    <div className="measurement-grid">
                        <div className="form-field">
                            <label>Indication before zero setting</label>
                            <input
                                type="number"
                                step="any"
                                value={form.zeroBefore || ""}
                                onChange={event =>
                                    setField(
                                        "zeroBefore",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="form-field">
                            <label>Indication after zero setting</label>
                            <input
                                type="number"
                                step="any"
                                value={form.zeroAfter || ""}
                                onChange={event =>
                                    setField(
                                        "zeroAfter",
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    {hasValues && (
                        <div className="formula-box">
                            <span>ZERO DEVIATION</span>
                            <strong>
                                {deviation} {instrument?.unit}
                            </strong>
                            <small>
                                Limit: ±0.25 e = ±
                                {0.25 *
                                    Number(
                                        instrument?.verificationScaleInterval
                                    )}{" "}
                                {instrument?.unit}
                            </small>
                        </div>
                    )}

                    <div className="calculation-note">
                        <strong>
                            R76-1:2006 §4.5.2
                        </strong>
                        <small>
                            After zero setting, the effect of zero deviation on the weighing result shall not exceed ±0.25 e.
                        </small>
                    </div>

                    <button
                        type="button"
                        className="primary-button large"
                        disabled={
                            working ||
                            !hasValues
                        }
                        onClick={() =>
                            saveGenericTest(
                                passes
                                    ? "PASS"
                                    : "FAIL",
                                {
                                    ...form,
                                    calculatedDeviation:
                                        deviation,
                                    limit:
                                        0.25 *
                                        Number(
                                            instrument?.verificationScaleInterval
                                        )
                                },
                                passes
                                    ? "Zero-setting deviation is within ±0.25 e."
                                    : "Zero-setting deviation exceeds ±0.25 e.",
                                "R76-1:2006 §4.5.2"
                            )
                        }
                    >
                        {working
                            ? "Saving..."
                            : "Evaluate & Continue →"}
                    </button>
                </div>
            );
        }

        if (
            currentTest.code ===
            "ECCENTRIC_LOADING"
        ) {
            const values = [
                form.position1,
                form.position2,
                form.position3,
                form.position4,
                form.position5
            ]
                .filter(
                    value =>
                        value !== undefined &&
                        value !== ""
                )
                .map(Number);

            const reference =
                Number(form.testLoad);

            const errors =
                values.map(value =>
                    value - reference
                );

            const maxAbsError =
                errors.length
                    ? Math.max(
                        ...errors.map(
                            Math.abs
                        )
                    )
                    : null;

            const mpe =
                reference > 0
                    ? calculateMpePreview(
                        instrument,
                        reference
                    )
                    : null;

            const complete =
                values.length >= 4 &&
                form.testLoad !== "";

            const passes =
                complete &&
                maxAbsError <= mpe;

            return (
                <div className="test-form-card">
                    <div className="form-field">
                        <label>
                            Eccentric test load ({instrument?.unit})
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={form.testLoad || ""}
                            onChange={event =>
                                setField(
                                    "testLoad",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="measurement-grid">
                        {[1,2,3,4,5].map(index => (
                            <div
                                className="form-field"
                                key={index}
                            >
                                <label>
                                    Position {index} indication
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={
                                        form[`position${index}`] ||
                                        ""
                                    }
                                    onChange={event =>
                                        setField(
                                            `position${index}`,
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {complete && (
                        <div className="formula-box">
                            <span>MAXIMUM ABSOLUTE ERROR</span>
                            <strong>
                                {maxAbsError} {instrument?.unit}
                            </strong>
                            <small>
                                Applicable MPE preview: ±{mpe} {instrument?.unit}
                            </small>
                        </div>
                    )}

                    <div className="calculation-note">
                        <strong>
                            R76-1:2006 §3.6.2
                        </strong>
                        <small>
                            Eccentric loading is checked at the applicable load-receptor positions. The error at each measurement is evaluated against the applicable MPE.
                        </small>
                    </div>

                    <button
                        type="button"
                        className="primary-button large"
                        disabled={
                            working ||
                            !complete
                        }
                        onClick={() =>
                            saveGenericTest(
                                passes
                                    ? "PASS"
                                    : "FAIL",
                                {
                                    ...form,
                                    maximumAbsoluteError:
                                        maxAbsError,
                                    permissibleError:
                                        mpe
                                },
                                passes
                                    ? "All recorded eccentric loading errors are within the applicable MPE."
                                    : "At least one recorded eccentric loading error exceeds the applicable MPE.",
                                "R76-1:2006 §3.6.2"
                            )
                        }
                    >
                        {working
                            ? "Saving..."
                            : "Evaluate & Continue →"}
                    </button>
                </div>
            );
        }

        if (!genericDefinition) {
            return null;
        }

        return (
            <div className="test-form-card">
                <div className="form-section-intro">
                    <strong>
                        {genericDefinition.title}
                    </strong>
                    <span>
                        Enter the observed test values and record the laboratory assessment.
                    </span>
                </div>

                <div className="measurement-grid">
                    {genericDefinition.fields.map(
                        ([key, label, type]) => (
                            <div
                                className="form-field"
                                key={key}
                            >
                                <label>{label}</label>

                                {type === "select" ? (
                                    <select
                                        value={
                                            form[key] || ""
                                        }
                                        onChange={event =>
                                            setField(
                                                key,
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select disturbance
                                        </option>
                                        <option value="voltage_variation">
                                            Voltage variation
                                        </option>
                                        <option value="electromagnetic">
                                            Electromagnetic disturbance
                                        </option>
                                        <option value="other">
                                            Other
                                        </option>
                                    </select>
                                ) : (
                                    <input
                                        type={
                                            type === "number"
                                                ? "number"
                                                : "text"
                                        }
                                        step="any"
                                        value={
                                            form[key] || ""
                                        }
                                        onChange={event =>
                                            setField(
                                                key,
                                                event.target.value
                                            )
                                        }
                                    />
                                )}
                            </div>
                        )
                    )}
                </div>

                <div className="form-field">
                    <label>Laboratory assessment</label>

                    <select
                        value={
                            form.assessment || ""
                        }
                        onChange={event =>
                            setField(
                                "assessment",
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Select assessment
                        </option>
                        <option value="PASS">
                            PASS
                        </option>
                        <option value="FAIL">
                            FAIL
                        </option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Observations / remarks</label>
                    <textarea
                        value={form.notes || ""}
                        onChange={event =>
                            setField(
                                "notes",
                                event.target.value
                            )
                        }
                        placeholder="Enter test observations"
                    />
                </div>

                <div className="calculation-note">
                    <strong>
                        {genericDefinition.basis}
                    </strong>
                    <small>
                        This workflow records the test evidence and laboratory assessment. A dedicated deterministic calculation is used where the current rule engine has an implemented formula.
                    </small>
                </div>

                <button
                    type="button"
                    className="primary-button large"
                    disabled={
                        working ||
                        !form.assessment
                    }
                    onClick={() =>
                        saveGenericTest(
                            form.assessment,
                            form,
                            form.assessment === "PASS"
                                ? "Laboratory assessment recorded as PASS."
                                : "Laboratory assessment recorded as FAIL.",
                            genericDefinition.basis
                        )
                    }
                >
                    {working
                        ? "Saving..."
                        : "Save Test & Continue →"}
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state">
                    Loading sequential R76 test workflow...
                </div>
            </div>
        );
    }

    if (!testPlan.length) {
        return (
            <div className="page">
                <div className="error-banner">
                    No applicable R76 tests were generated for this instrument.
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="eyebrow">
                        STEP 03 / GUIDED TESTING
                    </div>
                    <h1>Test Execution</h1>
                    <p>
                        Complete each applicable R76 test in sequence.
                        Previous tests cannot be skipped.
                    </p>
                </div>

                <div className="standard-chip">
                    R76:2006
                </div>
            </div>

            <div className="instrument-summary">
                <div>
                    <span>INSTRUMENT</span>
                    <strong>
                        {instrument?.manufacturer}{" "}
                        {instrument?.model}
                    </strong>
                </div>

                <div>
                    <span>SERIAL NUMBER</span>
                    <strong>
                        {instrument?.serialNumber}
                    </strong>
                </div>

                <div>
                    <span>CLASS</span>
                    <strong>
                        Class {instrument?.accuracyClass}
                    </strong>
                </div>

                <div>
                    <span>e</span>
                    <strong>
                        {instrument?.verificationScaleInterval}{" "}
                        {instrument?.unit}
                    </strong>
                </div>
            </div>

            <div className="testing-layout">
                <div className="testing-sidebar">
                    <div className="test-sidebar-title">
                        TEST PROGRESS
                    </div>

                    {testPlan.map(
                        (test, index) => {
                            const complete =
                                Boolean(
                                    completedCodes[
                                        test.code
                                    ]
                                );

                            const current =
                                index === currentIndex;

                            const locked =
                                index >
                                currentIndex;

                            return (
                                <button
                                    key={test.code}
                                    type="button"
                                    className={
                                        `test-sidebar-item ${
                                            current
                                                ? "active"
                                                : ""
                                        } ${
                                            locked
                                                ? "locked"
                                                : ""
                                        } ${
                                            complete
                                                ? "complete"
                                                : ""
                                        }`
                                    }
                                    disabled={
                                        locked ||
                                        index <
                                        currentIndex
                                    }
                                    onClick={() => {
                                        if (
                                            index ===
                                            currentIndex
                                        ) {
                                            setError("");
                                        }
                                    }}
                                >
                                    <span>
                                        {complete
                                            ? "✓"
                                            : String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                    </span>

                                    <div>
                                        <strong>
                                            {test.name}
                                        </strong>

                                        <small>
                                            {complete
                                                ? completedCodes[
                                                    test.code
                                                ]
                                                : locked
                                                    ? "LOCKED"
                                                    : "CURRENT"}
                                        </small>
                                    </div>
                                </button>
                            );
                        }
                    )}
                </div>

                <div className="testing-content">
                    <div className="test-content-header">
                        <div>
                            <div className="eyebrow">
                                TEST {currentIndex + 1} OF{" "}
                                {testPlan.length}
                            </div>

                            <h2>
                                {currentTest.name}
                            </h2>

                            <p>
                                Test code:{" "}
                                {currentTest.code}
                            </p>
                        </div>

                        <div className="test-status-badge">
                            {completedCodes[
                                currentTest.code
                            ]
                                ? completedCodes[
                                    currentTest.code
                                ]
                                : "IN PROGRESS"}
                        </div>
                    </div>

                    {renderGenericForm()}

                    {currentTest.code ===
                        "INDICATION_ERROR" && (
                        <div className="test-form-card">
                            <div className="measurement-grid">
                                <div className="form-field">
                                    <label>
                                        Reference Load ({instrument?.unit})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={
                                            form.referenceLoad ||
                                            ""
                                        }
                                        onChange={event =>
                                            setField(
                                                "referenceLoad",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Indicated Value ({instrument?.unit})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={
                                            form.indicatedValue ||
                                            ""
                                        }
                                        onChange={event =>
                                            setField(
                                                "indicatedValue",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="calculation-note">
                                <strong>
                                    Automatic R76 calculation
                                </strong>
                                <small>
                                    Error and MPE are calculated from the recorded load, accuracy class and verification scale interval.
                                </small>
                            </div>

                            <button
                                type="button"
                                className="primary-button large"
                                disabled={working}
                                onClick={
                                    runIndication
                                }
                            >
                                {working
                                    ? "Calculating..."
                                    : "Calculate & Continue →"}
                            </button>
                        </div>
                    )}

                    {currentTest.code ===
                        "REPEATABILITY" && (
                        <div className="test-form-card">
                            <div className="form-field">
                                <label>
                                    Reference Load ({instrument?.unit})
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    value={
                                        form.referenceLoad ||
                                        ""
                                    }
                                    onChange={event =>
                                        setField(
                                            "referenceLoad",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="repeatability-header">
                                <label>
                                    Repeated Indications
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
                                {(form.readings || [
                                    "",
                                    "",
                                    ""
                                ]).map(
                                    (
                                        reading,
                                        index
                                    ) => (
                                        <div
                                            className="reading-row"
                                            key={index}
                                        >
                                            <span>
                                                Reading{" "}
                                                {index + 1}
                                            </span>

                                            <input
                                                type="number"
                                                step="any"
                                                value={
                                                    reading
                                                }
                                                onChange={event =>
                                                    updateReading(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            {(form.readings || [
                                                "",
                                                "",
                                                ""
                                            ]).length >
                                                2 && (
                                                <button
                                                    type="button"
                                                    className="remove-button"
                                                    onClick={() =>
                                                        setField(
                                                            "readings",
                                                            (
                                                                form.readings ||
                                                                [
                                                                    "",
                                                                    "",
                                                                    ""
                                                                ]
                                                            ).filter(
                                                                (
                                                                    _,
                                                                    i
                                                                ) =>
                                                                    i !==
                                                                    index
                                                            )
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
                                    R76-1:2006 §3.6.1
                                </strong>
                                <small>
                                    The difference between repeated weighings is evaluated against the applicable MPE.
                                </small>
                            </div>

                            <button
                                type="button"
                                className="primary-button large"
                                disabled={working}
                                onClick={
                                    runRepeatability
                                }
                            >
                                {working
                                    ? "Calculating..."
                                    : "Calculate & Continue →"}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="calculation-result">
                            <div className="result-header">
                                <div>
                                    <span>
                                        TEST SAVED
                                    </span>
                                    <h3>
                                        {currentTest.name}
                                    </h3>
                                </div>

                                <div
                                    className={
                                        `result-pill ${
                                            completedCodes[
                                                currentTest.code
                                            ] === "PASS"
                                                ? "pass"
                                                : "fail"
                                        }`
                                    }
                                >
                                    {
                                        completedCodes[
                                            currentTest.code
                                        ] ||
                                        "SAVED"
                                    }
                                </div>
                            </div>

                            <div className="result-grid">
                                <div>
                                    <span>TEST</span>
                                    <strong>
                                        {currentIndex + 1}
                                    </strong>
                                </div>

                                <div>
                                    <span>STATUS</span>
                                    <strong>
                                        {
                                            completedCodes[
                                                currentTest.code
                                            ]
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>PROGRESS</span>
                                    <strong>
                                        {
                                            Object.keys(
                                                completedCodes
                                            ).length
                                        } /{" "}
                                        {testPlan.length}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="testing-footer">
                        <div>
                            <strong>
                                Sequential workflow
                            </strong>
                            <span>
                                {isLastTest
                                    ? "All applicable tests are now complete. Final evaluation is available."
                                    : `Complete Test ${currentIndex + 1} to unlock Test ${currentIndex + 2}.`}
                            </span>
                        </div>

                        {!isLastTest ? (
                            <button
                                type="button"
                                className="primary-button"
                                disabled={
                                    !completedCodes[
                                        currentTest.code
                                    ] ||
                                    working
                                }
                                onClick={
                                    goToNextTest
                                }
                            >
                                Next Test →
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="primary-button"
                                disabled={
                                    finalizing ||
                                    Object.keys(
                                        completedCodes
                                    ).length <
                                        testPlan.length
                                }
                                onClick={
                                    finalize
                                }
                            >
                                {finalizing
                                    ? "Evaluating..."
                                    : "Complete Evaluation →"}
                            </button>
                        )}
                    </div>

                    {isLastTest &&
                        Object.keys(
                            completedCodes
                        ).length ===
                            testPlan.length && (
                        <div className="testing-footer">
                            <div>
                                <strong>
                                    Evaluation complete
                                </strong>
                                <span>
                                    The final compliance decision is now available.
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
                    )}
                </div>
            </div>
        </div>
    );
}

function calculateMpePreview(instrument, load) {
    const e =
        Number(
            instrument?.verificationScaleInterval
        );

    const numericLoad = Number(load);

    if (!e || !numericLoad) {
        return null;
    }

    const intervals =
        numericLoad / e;

    const rules = {
        I: [
            [50000, 0.5],
            [200000, 1],
            [Infinity, 1.5]
        ],
        II: [
            [5000, 0.5],
            [20000, 1],
            [100000, 1.5]
        ],
        III: [
            [500, 0.5],
            [2000, 1],
            [10000, 1.5]
        ],
        IIII: [
            [50, 0.5],
            [200, 1],
            [1000, 1.5]
        ]
    };

    const classRules =
        rules[instrument?.accuracyClass] ||
        rules.III;

    const rule =
        classRules.find(
            ([limit]) =>
                intervals <= limit
        );

    if (!rule) {
        return null;
    }

    return rule[1] * e;
}

export default TestExecution;
