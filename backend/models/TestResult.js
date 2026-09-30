const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
    {
        testSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TestSession",
            required: true
        },

        testCode: {
            type: String,
            required: true
        },

        testName: {
            type: String,
            required: true
        },

        ruleVersion: {
            type: String,
            default: "R76-2006"
        },

        calculationId: {
            type: String,
            required: true,
            unique: true
        },

        inputs: {
            type: mongoose.Schema.Types.Mixed
        },

        calculations: [
            {
                parameter: String,
                value: mongoose.Schema.Types.Mixed,
                unit: String,
                formula: String
            }
        ],

        permissibleError: {
            value: Number,
            unit: String
        },

        observedError: {
            value: Number,
            unit: String
        },

        complianceStatus: {
            type: String,
            enum: [
                "PASS",
                "FAIL",
                "REVIEW_REQUIRED",
                "NOT_APPLICABLE",
                "PENDING"
            ],
            default: "PENDING"
        },

        explanation: {
            type: String
        },

        ruleBasis: {
            clause: String,
            description: String
        },

        calculatedBy: {
            type: String,
            default: "NAWI SmartLab Calculation Engine"
        },

        calculatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

testResultSchema.index({
    testSession: 1,
    testCode: 1
});

module.exports = mongoose.model(
    "TestResult",
    testResultSchema
);