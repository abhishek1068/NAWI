const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true,
            enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "SUBMIT",
                "APPROVE",
                "RETURN",
                "CALCULATE",
                "REPORT_GENERATE",
                "LOGIN",
                "LOGOUT"
            ]
        },

        entityType: {
            type: String,
            required: true
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        oldValue: {
            type: mongoose.Schema.Types.Mixed
        },

        newValue: {
            type: mongoose.Schema.Types.Mixed
        },

        reason: {
            type: String,
            trim: true
        },

        ipAddress: {
            type: String
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false
    }
);

auditLogSchema.index({
    entityType: 1,
    entityId: 1,
    timestamp: -1
});

module.exports = mongoose.model(
    "AuditLog",
    auditLogSchema
);