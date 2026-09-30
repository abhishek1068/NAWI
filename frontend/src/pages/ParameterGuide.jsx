import React from "react";

function ParameterGuide({
    onNavigate
}) {

    const parameters = [

        {
            symbol: "Max",
            title: "Maximum Capacity",
            description:
                "The maximum weighing capacity of the instrument."
        },

        {
            symbol: "Min",
            title: "Minimum Capacity",
            description:
                "The lower limit of the weighing range used for the instrument classification and evaluation."
        },

        {
            symbol: "e",
            title: "Verification Scale Interval",
            description:
                "The verification scale interval used for metrological classification and determination of permissible errors."
        },

        {
            symbol: "d",
            title: "Actual Scale Interval",
            description:
                "The actual scale interval of the instrument indication. It may differ from the verification scale interval."
        },

        {
            symbol: "n",
            title: "Number of Verification Intervals",
            description:
                "The number of verification scale intervals. For a single range it is calculated from Max/e."
        },

        {
            symbol: "Class",
            title: "Accuracy Class",
            description:
                "The R76 accuracy classification: Class I, II, III or IIII."
        },

        {
            symbol: "Unit",
            title: "Unit of Measurement",
            description:
                "The mass unit used for the instrument and its observations, such as kg, g or t."
        },

        {
            symbol: "Tare",
            title: "Tare Function",
            description:
                "Indicates whether the instrument provides a tare function. This can affect which tests are applicable."
        },

        {
            symbol: "Digital",
            title: "Digital Indication",
            description:
                "Identifies whether the instrument provides digital indication. Test applicability can depend on the indication method."
        },

        {
            symbol: "Ranges",
            title: "Number of Ranges",
            description:
                "The number of weighing ranges configured for the instrument."
        },

        {
            symbol: "Mobile",
            title: "Mobile Instrument",
            description:
                "Identifies an instrument designed for mobile use. Certain additional tests may become applicable."
        },

        {
            symbol: "Indicators",
            title: "Multiple Indicating Devices",
            description:
                "Identifies whether more than one indicating device is present."
        }

    ];


    const classes = [

        {
            className: "I",
            name: "Special"
        },

        {
            className: "II",
            name: "High"
        },

        {
            className: "III",
            name: "Medium"
        },

        {
            className: "IIII",
            name: "Ordinary"
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
                    OIML R76 PARAMETER GUIDE
                </div>

                <h1>
                    Understand the Parameters
                </h1>

                <p>
                    These are the principal instrument
                    parameters used by SmartLab when
                    creating the evaluation profile and
                    determining calculations.
                </p>

            </div>


            {/* CORE PARAMETERS */}

            <section className="parameter-section">

                <div className="parameter-section-heading">

                    <div className="eyebrow">
                        CORE METROLOGICAL PARAMETERS
                    </div>

                    <h2>
                        What do the values mean?
                    </h2>

                </div>


                <div className="parameter-grid">

                    {parameters.map(
                        parameter => (

                            <div
                                className="parameter-card"
                                key={
                                    parameter.symbol
                                }
                            >

                                <div className="parameter-symbol">
                                    {parameter.symbol}
                                </div>

                                <div>

                                    <h3>
                                        {parameter.title}
                                    </h3>

                                    <p>
                                        {
                                            parameter.description
                                        }
                                    </p>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* ACCURACY CLASSES */}

            <section className="class-section">

                <div className="parameter-section-heading">

                    <div className="eyebrow">
                        ACCURACY CLASSIFICATION
                    </div>

                    <h2>
                        R76 Accuracy Classes
                    </h2>

                    <p>
                        R76:2006 classifies instruments
                        according to their verification
                        scale interval and number of
                        verification scale intervals.
                    </p>

                </div>


                <div className="class-grid">

                    {classes.map(
                        item => (

                            <div
                                className="class-card"
                                key={
                                    item.className
                                }
                            >

                                <div className="class-symbol">
                                    {item.className}
                                </div>

                                <div>

                                    <span>
                                        CLASS
                                    </span>

                                    <h3>
                                        {item.name}
                                    </h3>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* SMARTLAB */}

            <section className="parameter-engine">

                <div>

                    <div className="eyebrow">
                        SMARTLAB ENGINE
                    </div>

                    <h2>
                        Why these parameters matter
                    </h2>

                    <p>
                        SmartLab uses the instrument
                        profile to determine which
                        tests are applicable and which
                        metrological calculations should
                        be performed.
                    </p>

                </div>

                <div className="engine-chain">

                    <span>
                        Instrument
                    </span>

                    <b>→</b>

                    <span>
                        Parameters
                    </span>

                    <b>→</b>

                    <span>
                        Test Plan
                    </span>

                    <b>→</b>

                    <span>
                        Calculation
                    </span>

                    <b>→</b>

                    <span>
                        Decision
                    </span>

                </div>

            </section>


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
                            "guide"
                        )
                    }
                >
                    How to Use SmartLab
                </button>

            </div>

        </div>
    );
}

export default ParameterGuide;