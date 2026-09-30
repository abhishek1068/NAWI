import React from "react";

function UserGuide({
    onNavigate
}) {

    const steps = [

        {
            number: "01",
            title: "Register the Instrument",
            text:
                "Enter the manufacturer, model, serial number, capacity, accuracy class and other technical characteristics of the NAWI."
        },

        {
            number: "02",
            title: "Smart Test Planning",
            text:
                "SmartLab analyzes the declared instrument configuration and creates a personalized test plan containing the applicable tests."
        },

        {
            number: "03",
            title: "Enter Observations",
            text:
                "During testing, enter the actual observations recorded from the instrument and reference equipment."
        },

        {
            number: "04",
            title: "Automatic Calculation",
            text:
                "The calculation engine determines measurement error, permissible error and other applicable calculated values."
        },

        {
            number: "05",
            title: "Compliance Decision",
            text:
                "The system compares the calculated result against the applicable rule and produces PASS, FAIL or REVIEW_REQUIRED."
        },

        {
            number: "06",
            title: "Generate Report",
            text:
                "The recorded instrument information, observations, calculations and decisions can be assembled into the test report."
        }

    ];

    return (
        <div className="info-page">

            <div className="info-header">

                <button
                    className="back-button"
                    onClick={() =>
                        onNavigate(
                            "home"
                        )
                    }
                >
                    ← Home
                </button>

                <div className="eyebrow">
                    SMARTLAB USER GUIDE
                </div>

                <h1>
                    How to use NAWI SmartLab
                </h1>

                <p>
                    A simple six-step workflow takes
                    you from an instrument profile to
                    a traceable compliance report.
                </p>

            </div>


            <div className="guide-timeline">

                {steps.map(step => (

                    <div
                        className="guide-step"
                        key={step.number}
                    >

                        <div className="guide-number">
                            {step.number}
                        </div>

                        <div className="guide-content">

                            <h2>
                                {step.title}
                            </h2>

                            <p>
                                {step.text}
                            </p>

                        </div>

                    </div>

                ))}

            </div>


            <div className="guide-callout">

                <div className="guide-callout-icon">
                    ✦
                </div>

                <div>

                    <strong>
                        SmartLab principle
                    </strong>

                    <p>
                        Raw observations remain the
                        source data. Calculations and
                        compliance decisions are produced
                        by the deterministic rule engine
                        rather than by an AI model.
                    </p>

                </div>

            </div>


            <div className="info-actions">

                <button
                    className="hero-primary"
                    onClick={() =>
                        onNavigate(
                            "dashboard"
                        )
                    }
                >
                    Start an Evaluation →
                </button>

                <button
                    className="hero-secondary"
                    onClick={() =>
                        onNavigate(
                            "parameters"
                        )
                    }
                >
                    Explore R76 Parameters
                </button>

            </div>

        </div>
    );
}

export default UserGuide;