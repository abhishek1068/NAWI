const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema(
    {
        testSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TestSession",
            required: true
        },

        testCode: {
            type: String,
            required: true,
            trim: true
        },

        testName: {
            type: String,
            required: true,
            trim: true
        },

        observationNumber: {
            type: Number,
            required: true,
            min: 1
        },

        referenceLoad: {
            type: Number
        },

        indicatedValue: {
            type: Number
        },

        position: {
            type: String,
            trim: true
        },

        unit: {
            type: String,
            default: "kg"
        },

        rawValue: {
            type: Number
        },

        textValue: {
            type: String,
            trim: true
        },

        notes: {
            type: String,
            trim: true
        },

        evidenceFiles: [
            {
                fileName: String,
                filePath: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        enteredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        recordedAt: {
            type: Date,
            default: Date.now
        },

        validationStatus: {
            type: String,
            enum: [
                "valid",
                "warning",
                "invalid",
                "pending"
            ],
            default: "pending"
        },

        validationMessages: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

observationSchema.index({
    testSession: 1,
    testCode: 1
});

module.exports = mongoose.model(
    "Observation",
    observationSchema
);