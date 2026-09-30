const R76_VERSION = "2006";

const ACCURACY_CLASSES = [
    "I",
    "II",
    "III",
    "IIII"
];

/*
    OIML R 76-1:2006
    Table 6
    Maximum permissible errors at initial verification.

    m = load / e
*/

const MPE_INITIAL = {
    I: [
        {
            maxIntervals: 50000,
            multiplier: 0.5
        },
        {
            maxIntervals: 200000,
            multiplier: 1.0
        },
        {
            maxIntervals: Infinity,
            multiplier: 1.5
        }
    ],

    II: [
        {
            maxIntervals: 5000,
            multiplier: 0.5
        },
        {
            maxIntervals: 20000,
            multiplier: 1.0
        },
        {
            maxIntervals: 100000,
            multiplier: 1.5
        }
    ],

    III: [
        {
            maxIntervals: 500,
            multiplier: 0.5
        },
        {
            maxIntervals: 2000,
            multiplier: 1.0
        },
        {
            maxIntervals: 10000,
            multiplier: 1.5
        }
    ],

    IIII: [
        {
            maxIntervals: 50,
            multiplier: 0.5
        },
        {
            maxIntervals: 200,
            multiplier: 1.0
        },
        {
            maxIntervals: 1000,
            multiplier: 1.5
        }
    ]
};

module.exports = {
    R76_VERSION,
    ACCURACY_CLASSES,
    MPE_INITIAL
};