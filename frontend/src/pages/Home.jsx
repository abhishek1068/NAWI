import React from "react";

function Home({
    onNavigate
}) {

    return (
        <div className="home-page">

            {/* HERO */}

            <section className="hero-section">

                <div className="hero-grid">

                    <div className="hero-content">

                        <div className="hero-badge">
                            <span className="hero-dot"></span>
                            DIGITAL LEGAL METROLOGY PLATFORM
                        </div>

                        <h1>
                            Smart Testing.
                            <br />
                            <span>Traceable Compliance.</span>
                        </h1>

                        <p className="hero-description">
                            NAWI SmartLab transforms the
                            evaluation of Non-Automatic
                            Weighing Instruments into a
                            guided, intelligent and
                            traceable digital workflow
                            based on OIML R76.
                        </p>

                        <div className="hero-actions">

                            <button
                                className="hero-primary"
                                onClick={() =>
                                    onNavigate(
                                        "dashboard"
                                    )
                                }
                            >
                                <span>
                                    Start Evaluation
                                </span>

                                <b>
                                    →
                                </b>
                            </button>

                            <button
                                className="hero-secondary"
                                onClick={() =>
                                    onNavigate(
                                        "guide"
                                    )
                                }
                            >
                                How does it work?
                            </button>

                        </div>

                        <div className="hero-standard">

                            <div>
                                <strong>
                                    OIML
                                </strong>

                                <span>
                                    R 76:2006
                                </span>
                            </div>

                            <div>
                                <strong>
                                    DIGITAL
                                </strong>

                                <span>
                                    Test Workflow
                                </span>
                            </div>

                            <div>
                                <strong>
                                    TRACEABLE
                                </strong>

                                <span>
                                    Decisions
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* VISUAL */}

                    <div className="hero-visual">

                        <div className="visual-glow"></div>

                        <div className="scale-orbit orbit-one"></div>
                        <div className="scale-orbit orbit-two"></div>

                        <div className="scale-card">

                            <div className="scale-top">

                                <div className="scale-brand">
                                    NAWI
                                </div>

                                <span>
                                    SMARTLAB
                                </span>

                            </div>

                            <div className="scale-display">

                                <span>
                                    MASS
                                </span>

                                <strong>
                                    100.00
                                </strong>

                                <small>
                                    kg
                                </small>

                            </div>

                            <div className="scale-platform">

                                <div className="scale-platform-line"></div>

                            </div>

                            <div className="scale-base">

                                <div></div>
                                <div></div>
                                <div></div>

                            </div>

                        </div>


                        <div className="floating-card card-mpe">

                            <span>
                                MPE
                            </span>

                            <strong>
                                ±0.05 kg
                            </strong>

                            <small>
                                Rule Engine
                            </small>

                        </div>


                        <div className="floating-card card-pass">

                            <div className="floating-check">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    COMPLIANT
                                </strong>

                                <small>
                                    Calculation verified
                                </small>

                            </div>

                        </div>


                        <div className="floating-card card-r76">

                            <span>
                                STANDARD
                            </span>

                            <strong>
                                R76
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* THREE MAIN OPTIONS */}

            <section className="home-options">

                <div className="section-heading">

                    <div className="eyebrow">
                        EXPLORE SMARTLAB
                    </div>

                    <h2>
                        Everything you need to
                        evaluate a NAWI.
                    </h2>

                    <p>
                        Start an evaluation, learn the
                        workflow, or understand the
                        metrological parameters before
                        testing.
                    </p>

                </div>


                <div className="option-grid">


                    {/* START */}

                    <button
                        className="home-option primary-option"
                        onClick={() =>
                            onNavigate(
                                "dashboard"
                            )
                        }
                    >

                        <div className="option-icon">
                            ⚖
                        </div>

                        <div className="option-number">
                            01
                        </div>

                        <h3>
                            Start Evaluation
                        </h3>

                        <p>
                            Register an instrument,
                            generate its personalized
                            OIML R76 test plan and
                            begin guided testing.
                        </p>

                        <span className="option-link">
                            Enter SmartLab →
                        </span>

                    </button>


                    {/* GUIDE */}

                    <button
                        className="home-option"
                        onClick={() =>
                            onNavigate(
                                "guide"
                            )
                        }
                    >

                        <div className="option-icon">
                            ◈
                        </div>

                        <div className="option-number">
                            02
                        </div>

                        <h3>
                            How to Use SmartLab
                        </h3>

                        <p>
                            Follow the complete workflow
                            from instrument registration
                            to compliance decision and
                            report generation.
                        </p>

                        <span className="option-link">
                            Open User Guide →
                        </span>

                    </button>


                    {/* PARAMETERS */}

                    <button
                        className="home-option"
                        onClick={() =>
                            onNavigate(
                                "parameters"
                            )
                        }
                    >

                        <div className="option-icon">
                            ∑
                        </div>

                        <div className="option-number">
                            03
                        </div>

                        <h3>
                            R76 Parameters
                        </h3>

                        <p>
                            Understand Max, Min, e, d,
                            verification intervals,
                            accuracy classes and the
                            parameters used by SmartLab.
                        </p>

                        <span className="option-link">
                            Explore Parameters →
                        </span>

                    </button>

                </div>

            </section>


            {/* WORKFLOW STRIP */}

            <section className="home-workflow">

                <div className="workflow-heading">

                    <div className="eyebrow">
                        DIGITAL WORKFLOW
                    </div>

                    <h2>
                        From raw observation to
                        traceable decision.
                    </h2>

                </div>

                <div className="home-flow">

                    <div>
                        <b>01</b>
                        <span>
                            Instrument
                        </span>
                    </div>

                    <i>→</i>

                    <div>
                        <b>02</b>
                        <span>
                            Test Plan
                        </span>
                    </div>

                    <i>→</i>

                    <div>
                        <b>03</b>
                        <span>
                            Observation
                        </span>
                    </div>

                    <i>→</i>

                    <div>
                        <b>04</b>
                        <span>
                            Calculation
                        </span>
                    </div>

                    <i>→</i>

                    <div>
                        <b>05</b>
                        <span>
                            Compliance
                        </span>
                    </div>

                    <i>→</i>

                    <div>
                        <b>06</b>
                        <span>
                            Report
                        </span>
                    </div>

                </div>

            </section>


            {/* FOOTER */}

            <footer className="home-footer">

                <div>
                    <strong>
                        NAWI SmartLab
                    </strong>

                    <span>
                        Digital OIML R76
                        Type-Evaluation Platform
                    </span>
                </div>

                <div>
                    OIML R76:2006
                </div>

            </footer>

        </div>
    );
}

export default Home;