const mongoose = require("mongoose");

const instrumentSchema = new mongoose.Schema(
    {
        manufacturer: {
            type: String,
            required: true,
            trim: true
        },

        model: {
            type: String,
            required: true,
            trim: true
        },

        serialNumber: {
            type: String,
            required: true,
            trim: true
        },

        instrumentType: {
            type: String,
            required: true,
            enum: [
                "electronic_weighing_instrument",
                "platform_scale",
                "weighbridge",
                "other"
            ]
        },

        accuracyClass: {
            type: String,
            enum: [
                "I",
                "II",
                "III",
                "IIII"
            ],
            trim: true
        },

        maximumCapacity: {
            type: Number,
            required: true,
            min: 0
        },

        minimumCapacity: {
            type: Number,
            min: 0
        },

        verificationScaleInterval: {
            type: Number,
            min: 0
        },

        actualScaleInterval: {
            type: Number,
            min: 0
        },

        unit: {
            type: String,
            default: "kg"
        },

        numberOfVerificationIntervals: {
            type: Number,
            min: 0
        },

        numberOfRanges: {
            type: Number,
            default: 1,
            min: 1
        },

        // -----------------------------------------
        // INSTRUMENT CONFIGURATION
        // -----------------------------------------

        tareFunction: {
            type: Boolean,
            default: false
        },

        selfIndicating: {
            type: Boolean,
            default: true
        },

        digitalIndication: {
            type: Boolean,
            default: true
        },

        multipleIndicatingDevices: {
            type: Boolean,
            default: false
        },

        mobileInstrument: {
            type: Boolean,
            default: false
        },

        specialFunctions: [
            {
                type: String,
                trim: true
            }
        ],

        // -----------------------------------------
        // MANUFACTURER DETAILS
        // -----------------------------------------

        manufacturerDetails: {
            address: String,
            country: String,
            contact: String,
            email: String
        },

        // -----------------------------------------
        // LABORATORY DETAILS
        // -----------------------------------------

        laboratoryDetails: {
            laboratoryName: String,
            laboratoryAddress: String,
            accreditationNumber: String
        },

        // -----------------------------------------
        // REGISTRATION
        // -----------------------------------------

        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        registeredByName: {
            type: String,
            default: "NAWI SmartLab Demo"
        },

        // -----------------------------------------
        // STATUS
        // -----------------------------------------

        status: {
            type: String,
            enum: [
                "active",
                "testing",
                "completed",
                "archived"
            ],
            default: "active"
        }
    },

    {
        timestamps: true
    }
);

// ---------------------------------------------
// INDEXES
// ---------------------------------------------

instrumentSchema.index({
    manufacturer: 1,
    model: 1
});

instrumentSchema.index({
    serialNumber: 1
});

module.exports = mongoose.model(
    "Instrument",
    instrumentSchema
);