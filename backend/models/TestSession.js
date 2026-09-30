const mongoose = require("mongoose");

const testSessionSchema = new mongoose.Schema(
    {
        instrument: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Instrument",
            required: true
        },

        sessionNumber: {
            type: String,
            required: true,
            unique: true
        },

        reportNumber: {
            type: String,
            trim: true
        },

        standard: {
            name: {
                type: String,
                default: "OIML R 76"
            },

            version: {
                type: String,
                default: "2006"
            }
        },

        testType: {
            type: String,
            default: "Type Evaluation"
        },

        // -----------------------------------------
        // ENVIRONMENT
        // -----------------------------------------

        environmentalConditions: {
            temperature: Number,
            humidity: Number,
            atmosphericPressure: Number,

            temperatureUnit: {
                type: String,
                default: "°C"
            },

            humidityUnit: {
                type: String,
                default: "%"
            },

            pressureUnit: {
                type: String,
                default: "hPa"
            }
        },

        // -----------------------------------------
        // GENERATED TEST PLAN
        // -----------------------------------------

        applicableTests: [
            {
                code: String,
                name: String,
                category: String,

                applicable: {
                    type: Boolean,
                    default: true
                },

                status: {
                    type: String,
                    enum: [
                        "pending",
                        "in_progress",
                        "passed",
                        "failed",
                        "review_required",
                        "not_applicable"
                    ],
                    default: "pending"
                }
            }
        ],

        // -----------------------------------------
        // SESSION STATUS
        // -----------------------------------------

        status: {
            type: String,
            enum: [
                "draft",
                "testing",
                "submitted",
                "under_review",
                "returned",
                "approved",
                "completed"
            ],
            default: "draft"
        },

        overallResult: {
            type: String,
            enum: [
                "pending",
                "pass",
                "fail",
                "review_required"
            ],
            default: "pending"
        },

        // -----------------------------------------
        // DEMO USER INFORMATION
        // -----------------------------------------

        technician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        technicianName: {
            type: String,
            default: "NAWI SmartLab Technician"
        },

        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewerName: {
            type: String,
            default: null
        },

        reviewerComments: {
            type: String,
            trim: true
        },

        // -----------------------------------------
        // TIMESTAMPS
        // -----------------------------------------

        startedAt: Date,

        submittedAt: Date,

        reviewedAt: Date,

        completedAt: Date
    },

    {
        timestamps: true
    }
);

// ---------------------------------------------
// INDEXES
// ---------------------------------------------

testSessionSchema.index({
    instrument: 1,
    createdAt: -1
});

testSessionSchema.index({
    status: 1
});

module.exports = mongoose.model(
    "TestSession",
    testSessionSchema
);