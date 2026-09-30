import React, {
    useState
} from "react";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import UserGuide from "./pages/UserGuide";
import ParameterGuide from "./pages/ParameterGuide";

import Dashboard from "./pages/Dashboard";
import InstrumentRegistration from "./pages/InstrumentRegistration";
import TestPlan from "./pages/TestPlan";
import TestExecution from "./pages/TestExecution";
import TestResults from "./pages/TestResults";

import "./styles/app.css";


function App() {

    const [
        currentPage,
        setCurrentPage
    ] = useState("home");

    const [
        selectedInstrument,
        setSelectedInstrument
    ] = useState(null);

    const [
        selectedSession,
        setSelectedSession
    ] = useState(null);


    const navigate = (
        page,
        instrument = selectedInstrument,
        session = selectedSession
    ) => {

        if (
            instrument !== undefined
        ) {
            setSelectedInstrument(
                instrument
            );
        }

        if (
            session !== undefined
        ) {
            setSelectedSession(
                session
            );
        }

        setCurrentPage(
            page
        );
    };


    const renderPage = () => {

        switch (
            currentPage
        ) {

            case "home":

                return (
                    <Home
                        onNavigate={
                            navigate
                        }
                    />
                );


            case "guide":

                return (
                    <UserGuide
                        onNavigate={
                            navigate
                        }
                    />
                );


            case "parameters":

                return (
                    <ParameterGuide
                        onNavigate={
                            navigate
                        }
                    />
                );


            case "dashboard":

                return (
                    <Dashboard
                        setCurrentPage={
                            setCurrentPage
                        }
                        setSelectedInstrument={
                            setSelectedInstrument
                        }
                    />
                );


            case "instrument":

                return (
                    <InstrumentRegistration
                        onComplete={
                            instrument =>
                                navigate(
                                    "testplan",
                                    instrument,
                                    null
                                )
                        }
                    />
                );


            case "testplan":

                return (
                    <TestPlan
                        instrument={
                            selectedInstrument
                        }
                        onTesting={
                            session =>
                                navigate(
                                    "testing",
                                    selectedInstrument,
                                    session
                                )
                        }
                    />
                );


            case "testing":

                return (
                    <TestExecution
                        instrument={
                            selectedInstrument
                        }
                        session={
                            selectedSession
                        }
                        onComplete={() =>
                            navigate(
                                "results"
                            )
                        }
                    />
                );


            case "results":

                return (
                    <TestResults
                        instrument={
                            selectedInstrument
                        }
                        session={
                            selectedSession
                        }
                    />
                );


            default:

                return (
                    <Home
                        onNavigate={
                            navigate
                        }
                    />
                );
        }
    };


    /*
     * The home, guide and parameter pages
     * use a clean full-width presentation.
     *
     * The actual SmartLab workspace uses
     * the sidebar.
     */

    const isLandingPage =
        currentPage === "home" ||
        currentPage === "guide" ||
        currentPage === "parameters";


    if (isLandingPage) {

        return (
            <div className="landing-shell">

                <div className="landing-topbar">

                    <button
                        className="landing-logo"
                        onClick={() =>
                            navigate(
                                "home"
                            )
                        }
                    >

                        <span>
                            ⚖
                        </span>

                        <div>

                            <strong>
                                NAWI SmartLab
                            </strong>

                            <small>
                                OIML R76 Platform
                            </small>

                        </div>

                    </button>


                    <nav className="landing-nav">

                        <button
                            className={
                                currentPage ===
                                "home"
                                    ? "landing-nav-active"
                                    : ""
                            }
                            onClick={() =>
                                navigate(
                                    "home"
                                )
                            }
                        >
                            Home
                        </button>

                        <button
                            className={
                                currentPage ===
                                "guide"
                                    ? "landing-nav-active"
                                    : ""
                            }
                            onClick={() =>
                                navigate(
                                    "guide"
                                )
                            }
                        >
                            How It Works
                        </button>

                        <button
                            className={
                                currentPage ===
                                "parameters"
                                    ? "landing-nav-active"
                                    : ""
                            }
                            onClick={() =>
                                navigate(
                                    "parameters"
                                )
                            }
                        >
                            R76 Parameters
                        </button>

                    </nav>


                    <button
                        className="landing-start"
                        onClick={() =>
                            navigate(
                                "dashboard"
                            )
                        }
                    >
                        Enter SmartLab →
                    </button>

                </div>

                {renderPage()}

            </div>
        );
    }


    return (
        <div className="app-shell">

            <Sidebar
                currentPage={
                    currentPage
                }
                setCurrentPage={
                    setCurrentPage
                }
            />

            <main className="main-content">
                {renderPage()}
            </main>

        </div>
    );
}


export default App;