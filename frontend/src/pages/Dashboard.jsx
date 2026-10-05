import React, {
    useEffect,
    useState
} from "react";

import {
    getInstruments,
    deleteInstrument
} from "../services/api";

import StatCard from "../components/StatCard";

function Dashboard({
    setCurrentPage,
    setSelectedInstrument
}) {

    const [
        instruments,
        setInstruments
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            const response =
                await getInstruments();

            setInstruments(
                response.data.instruments || []
            );

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    const handleDeleteInstrument = async (
    instrument
) => {

    const confirmed =
        window.confirm(

            `Remove ${instrument.manufacturer} ${instrument.model}?\n\n` +

            `Serial Number: ${instrument.serialNumber}\n\n` +

            `This will permanently remove the instrument, ` +
            `its test sessions, test results, observations, ` +
            `and generated reports.\n\n` +

            `This action cannot be undone.`

        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteInstrument(
            instrument._id
        );


        await loadData();


    }
    catch (error) {

        console.error(
            "Delete instrument error:",
            error
        );


        window.alert(

            error.response
                ?.data
                ?.message ||

            "Unable to remove instrument."

        );

    }

};

    const testing =
        instruments.filter(
            item =>
                item.status === "testing"
        ).length;

    const completed =
        instruments.filter(
            item =>
                item.status === "completed"
        ).length;

    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <div className="eyebrow">
                        LABORATORY WORKSPACE
                    </div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Digital type-evaluation
                        workflow for non-automatic
                        weighing instruments.
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        setCurrentPage(
                            "instrument"
                        )
                    }
                >
                    + Register Instrument
                </button>

            </div>

            <div className="stats-grid">

                <StatCard
                    title="Registered Instruments"
                    value={
                        instruments.length
                    }
                    subtitle="Total instruments"
                    icon="⚖"
                />

                <StatCard
                    title="Active Testing"
                    value={testing}
                    subtitle="Sessions in progress"
                    icon="◉"
                />

                <StatCard
                    title="Completed"
                    value={completed}
                    subtitle="Completed evaluations"
                    icon="✓"
                />

                <StatCard
                    title="Standard"
                    value="R76"
                    subtitle="OIML R 76:2006"
                    icon="§"
                />

            </div>

            <div className="dashboard-grid">

                <div className="panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                Recent Instruments
                            </h2>

                            <span>
                                Latest registered NAWIs
                            </span>

                        </div>

                    </div>

                    {loading ? (

                        <div className="loading-state">
                            Loading instruments...
                        </div>

                    ) : instruments.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ⚖
                            </div>

                            <h3>
                                No instruments yet
                            </h3>

                            <p>
                                Register your first
                                NAWI to generate an
                                automatic R76 test plan.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    setCurrentPage(
                                        "instrument"
                                    )
                                }
                            >
                                Register Instrument
                            </button>

                        </div>

                    ) : (

                        <div className="instrument-list">

                            {instruments
                                .slice(0, 8)
                                .map(instrument => (

                                    <div
                                        className="instrument-row"
                                        key={
                                            instrument._id
                                        }
                                        onClick={() => {

                                            setSelectedInstrument(
                                                instrument
                                            );


                                            if (
                                                instrument.status ===
                                                "completed"
                                            ) {

                                                setCurrentPage(
                                                    "results"
                                                );

                                            }
                                            else {

                                                setCurrentPage(
                                                    "testplan"
                                                );

                                            }

                                        }}
                                    >

                                        <div className="instrument-avatar">

                                            ⚖

                                        </div>


                                        <div className="instrument-info">

                                            <strong>

                                                {
                                                    instrument.manufacturer
                                                }{" "}

                                                {
                                                    instrument.model
                                                }

                                            </strong>


                                            <span>

                                                S/N:{" "}

                                                {
                                                    instrument.serialNumber
                                                }

                                            </span>

                                        </div>


                                        <span
                                            className={
                                                `status-badge ${instrument.status}`
                                            }
                                        >

                                            {
                                                instrument.status
                                            }

                                        </span>


                                        <button
                                            type="button"
                                            className="instrument-delete-button"
                                            title="Remove instrument"
                                            onClick={(
                                                event
                                            ) => {

                                                event.stopPropagation();

                                                handleDeleteInstrument(
                                                    instrument
                                                );

                                            }}
                                        >

                                            🗑

                                        </button>


                                    </div>

                                ))}

                        </div>

                    )}

                </div>

                <div className="panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                SmartLab Workflow
                            </h2>

                            <span>
                                From instrument to report
                            </span>

                        </div>

                    </div>

                    <div className="workflow">

                        <div className="workflow-step">
                            <b>01</b>
                            <span>
                                Instrument Profile
                            </span>
                        </div>

                        <div className="workflow-line" />

                        <div className="workflow-step">
                            <b>02</b>
                            <span>
                                Test Intelligence
                            </span>
                        </div>

                        <div className="workflow-line" />

                        <div className="workflow-step">
                            <b>03</b>
                            <span>
                                Guided Testing
                            </span>
                        </div>

                        <div className="workflow-line" />

                        <div className="workflow-step">
                            <b>04</b>
                            <span>
                                Compliance
                            </span>
                        </div>

                        <div className="workflow-line" />

                        <div className="workflow-step">
                            <b>05</b>
                            <span>
                                Traceable Report
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;