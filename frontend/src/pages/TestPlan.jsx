import React, {
    useEffect,
    useState
} from "react";

import {
    startTestSession,
    getTestPlan
} from "../services/api";

function TestPlan({
    instrument,
    onTesting
}) {

    const [session, setSession] =
        useState(null);

    const [testPlan, setTestPlan] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [starting, setStarting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        if (instrument?._id) {
            createSession();
        }

    }, [instrument]);

    const createSession = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await startTestSession(
                    instrument._id
                );

            setSession(
                response.data.session
            );

            setTestPlan(
                response.data.testPlan || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to generate test plan"
            );

        } finally {

            setLoading(false);

        }
    };

    const beginTesting = async () => {

        if (!session) {
            return;
        }

        setStarting(true);

        try {

            const response =
                await getTestPlan(
                    session.id
                );

            onTesting({
                ...session,
                testPlan:
                    response.data.testPlan
            });

        } catch (err) {

            console.error(err);

            setError(
                "Unable to open test session"
            );

        } finally {

            setStarting(false);
        }
    };

    if (!instrument) {

        return (
            <div className="page">

                <div className="empty-state">

                    <h2>
                        No instrument selected
                    </h2>

                    <p>
                        Register an instrument first.
                    </p>

                </div>

            </div>
        );
    }

    if (loading) {

        return (
            <div className="page">

                <div className="loading-state">
                    Generating intelligent
                    OIML R76 test plan...
                </div>

            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <div className="eyebrow">
                        STEP 02 / TEST INTELLIGENCE
                    </div>

                    <h1>
                        Personalized Test Plan
                    </h1>

                    <p>
                        SmartLab analyzed the instrument
                        configuration and selected the
                        applicable tests.
                    </p>

                </div>

                <div className="standard-chip">
                    OIML R76:2006
                </div>

            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <div className="instrument-summary">

                <div>
                    <span>INSTRUMENT</span>
                    <strong>
                        {instrument.manufacturer}{" "}
                        {instrument.model}
                    </strong>
                </div>

                <div>
                    <span>SERIAL NUMBER</span>
                    <strong>
                        {instrument.serialNumber}
                    </strong>
                </div>

                <div>
                    <span>ACCURACY CLASS</span>
                    <strong>
                        Class {instrument.accuracyClass}
                    </strong>
                </div>

                <div>
                    <span>CAPACITY</span>
                    <strong>
                        {instrument.maximumCapacity}{" "}
                        {instrument.unit}
                    </strong>
                </div>

            </div>

            <div className="test-plan-header">

                <div>

                    <h2>
                        Applicable Tests
                    </h2>

                    <p>
                        Automatically generated from
                        instrument characteristics.
                    </p>

                </div>

                <div className="test-count">

                    <strong>
                        {
                            testPlan.filter(
                                test =>
                                    test.applicable
                            ).length
                        }
                    </strong>

                    <span>
                        applicable tests
                    </span>

                </div>

            </div>

            <div className="test-list">

                {testPlan.map(
                    (test, index) => (

                        <div
                            className={
                                test.applicable
                                    ? "test-card"
                                    : "test-card disabled"
                            }
                            key={test.code}
                        >

                            <div className="test-number">
                                {String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}
                            </div>

                            <div className="test-content">

                                <div className="test-code">
                                    {test.code}
                                </div>

                                <h3>
                                    {test.name}
                                </h3>

                                <span>
                                    {test.category ||
                                        "General"}
                                </span>

                            </div>

                            {test.applicable ? (

                                <span className="applicable">
                                    ✓ Applicable
                                </span>

                            ) : (

                                <span className="not-applicable">
                                    — Not Applicable
                                </span>

                            )}

                        </div>
                    )
                )}

            </div>

            <div className="test-plan-actions">

                <div className="intelligence-message">

                    <div className="intelligence-icon">
                        ✦
                    </div>

                    <div>

                        <strong>
                            Explainable Test Intelligence
                        </strong>

                        <span>
                            SmartLab uses the declared
                            instrument configuration
                            to determine applicable tests.
                        </span>

                    </div>

                </div>

                <button
                    className="primary-button large"
                    onClick={
                        beginTesting
                    }
                    disabled={starting}
                >
                    {starting
                        ? "Opening Session..."
                        : "Begin Guided Testing →"
                    }
                </button>

            </div>

        </div>
    );
}

export default TestPlan;