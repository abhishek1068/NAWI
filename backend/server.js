const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

const testResultRoutes =
    require("./routes/testResultRoutes");

const instrumentRoutes =
    require("./routes/instrumentRoutes");

const testRoutes =
    require("./routes/testRoutes");

const reportRoutes =
    require("./routes/reportRoutes");


// ==================================================
// ENVIRONMENT
// ==================================================

dotenv.config();


// ==================================================
// DATABASE
// ==================================================

connectDB();


// ==================================================
// EXPRESS
// ==================================================

const app = express();


// ==================================================
// SECURITY
// ==================================================

app.use(
    helmet()
);

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


// ==================================================
// BODY PARSING
// ==================================================

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


// ==================================================
// STATIC FILES
// ==================================================

app.use(
    "/reports",
    express.static(
        path.join(
            __dirname,
            "reports"
        )
    )
);

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


// ==================================================
// BASIC SERVER CHECK
// ==================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            application:
                "NAWI SmartLab",

            message:
                "NAWI SmartLab backend is running",

            version:
                "1.0.0"

        });

    }
);


// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            application:
                "NAWI SmartLab",

            status:
                "online",

            database:
                "connected",

            timestamp:
                new Date().toISOString()

        });

    }
);


// ==================================================
// INSTRUMENT API
// ==================================================

app.use(
    "/api/instruments",
    instrumentRoutes
);


// ==================================================
// TEST API
// ==================================================

app.use(
    "/api/tests",
    testRoutes
);


// ==================================================
// TEST RESULT API
// IMPORTANT FOR LIVE COMPLIANCE
// ==================================================

app.use(
    "/api/test-results",
    testResultRoutes
);


// ==================================================
// REPORT API
// ==================================================

app.use(
    "/api/reports",
    reportRoutes
);


// ==================================================
// 404 HANDLER
// ==================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API route not found",

            path:
                req.originalUrl

        });

    }
);


// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Server error:",
            error
        );

        res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Internal server error"

        });

    }
);


// ==================================================
// START SERVER
// ==================================================

const PORT =
    process.env.PORT || 5100;


app.listen(
    PORT,
    () => {

        console.log(
            "=========================================="
        );

        console.log(
            "NAWI SmartLab Backend"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            "Test Results API: /api/test-results"
        );

        console.log(
            "=========================================="
        );

    }
);