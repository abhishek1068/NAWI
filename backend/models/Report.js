const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        testSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TestSession",
            required: true
        },

        instrument: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Instrument",
            required: true
        },

        reportNumber: {
            type: String,
            required: true,
            unique: true
        },

        reportVersion: {
            type: Number,
            default: 1
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

        overallResult: {
            type: String,
            enum: [
                "PASS",
                "FAIL",
                "REVIEW_REQUIRED"
            ]
        },

        pdfFile: {
            fileName: String,
            filePath: String,
            generatedAt: Date
        },

        docxFile: {
            fileName: String,
            filePath: String,
            generatedAt: Date
        },

        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        approvedAt: Date,

        isFinal: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

reportSchema.index({
    instrument: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Report",
    reportSchema
);