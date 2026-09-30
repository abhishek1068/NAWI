const R76_TESTS = [
    {
        code: "VISUAL_EXAMINATION",
        name: "Visual Examination",
        category: "general",
        defaultApplicable: true,
        inputs: [
            "accuracyClass",
            "minimumCapacity",
            "maximumCapacity",
            "verificationScaleInterval",
            "actualScaleInterval"
        ]
    },

    {
        code: "INDICATION_ERROR",
        name: "Errors of Indication / Weighing Performance",
        category: "metrological",
        defaultApplicable: true,
        inputs: [
            "referenceLoad",
            "indicatedValue"
        ]
    },

    {
        code: "ZERO_SETTING",
        name: "Zero-Setting Accuracy",
        category: "metrological",
        defaultApplicable: true,
        inputs: [
            "zeroBefore",
            "zeroAfter"
        ]
    },

    {
        code: "TARE_ACCURACY",
        name: "Tare Device Accuracy",
        category: "metrological",
        defaultApplicable: false,
        requires: "tareFunction",
        inputs: [
            "tareLoad",
            "tareIndication"
        ]
    },

    {
        code: "REPEATABILITY",
        name: "Repeatability",
        category: "metrological",
        defaultApplicable: true,
        inputs: [
            "referenceLoad",
            "repeatedIndications"
        ]
    },

    {
        code: "ECCENTRIC_LOADING",
        name: "Eccentric Loading",
        category: "metrological",
        defaultApplicable: true,
        inputs: [
            "testLoad",
            "position",
            "indicatedValue"
        ]
    },

    {
        code: "DISCRIMINATION",
        name: "Discrimination",
        category: "metrological",
        defaultApplicable: false,
        requires: "nonDigitalIndication",
        inputs: [
            "load",
            "additionalLoad",
            "indicationBefore",
            "indicationAfter"
        ]
    },

    {
        code: "INFLUENCE_FACTORS",
        name: "Influence Factor Tests",
        category: "influence",
        defaultApplicable: true,
        inputs: [
            "environmentalCondition",
            "referenceLoad",
            "indicatedValue"
        ]
    },

    {
        code: "DISTURBANCES",
        name: "Disturbance Tests",
        category: "disturbance",
        defaultApplicable: true,
        inputs: [
            "disturbanceType",
            "referenceLoad",
            "indicatedValue"
        ]
    },

    {
        code: "MULTIPLE_INDICATING_DEVICES",
        name: "Multiple Indicating Devices",
        category: "metrological",
        defaultApplicable: false,
        requires: "multipleIndicatingDevices",
        inputs: [
            "load",
            "indicationDevice1",
            "indicationDevice2"
        ]
    },

    {
        code: "TILT",
        name: "Tilt Test",
        category: "special",
        defaultApplicable: false,
        requires: "mobileInstrument",
        inputs: [
            "tiltAngle",
            "referenceLoad",
            "indicatedValue"
        ]
    }
];

module.exports = R76_TESTS;