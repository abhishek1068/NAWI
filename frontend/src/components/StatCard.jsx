import React from "react";

function StatCard({
    title,
    value,
    subtitle,
    icon
}) {

    return (
        <div className="stat-card">

            <div className="stat-top">

                <div className="stat-title">
                    {title}
                </div>

                <div className="stat-icon">
                    {icon}
                </div>

            </div>

            <div className="stat-value">
                {value}
            </div>

            <div className="stat-subtitle">
                {subtitle}
            </div>

        </div>
    );
}

export default StatCard;