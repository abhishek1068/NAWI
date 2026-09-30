import React from "react";


function Sidebar({
    currentPage,
    setCurrentPage
}) {

    const menu = [

        {
            id: "dashboard",
            label: "Dashboard",
            icon: "▦"
        },

        {
            id: "instrument",
            label: "Register Instrument",
            icon: "+"
        },

        {
            id: "testplan",
            label: "Test Plan",
            icon: "☷"
        },

        {
            id: "testing",
            label: "Test Execution",
            icon: "✓"
        },

        {
            id: "results",
            label: "Results & Report",
            icon: "▤"
        }

    ];


    return (
        <aside className="sidebar">

            <button
                className="brand"
                onClick={() =>
                    setCurrentPage(
                        "home"
                    )
                }
            >

                <div className="brand-mark">
                    ⚖
                </div>

                <div>

                    <div className="brand-name">
                        NAWI SmartLab
                    </div>

                    <div className="brand-subtitle">
                        OIML R76 Platform
                    </div>

                </div>

            </button>


            <button
                className="sidebar-home"
                onClick={() =>
                    setCurrentPage(
                        "home"
                    )
                }
            >
                ← Back to Home
            </button>


            <div className="sidebar-section">
                WORKSPACE
            </div>


            <nav>

                {menu.map(
                    item => (

                        <button
                            key={
                                item.id
                            }
                            className={
                                currentPage ===
                                item.id
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() =>
                                setCurrentPage(
                                    item.id
                                )
                            }
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </button>

                    )
                )}

            </nav>


            <div className="sidebar-footer">

                <div className="system-status">

                    <span className="status-dot"></span>

                    System Online

                </div>

                <div className="version">
                    NAWI SmartLab v1.0
                </div>

            </div>

        </aside>
    );
}


export default Sidebar;