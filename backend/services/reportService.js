const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    WidthType
} = require("docx");

const TestSession = require("../models/TestSession");
const TestResult = require("../models/TestResult");
const Report = require("../models/Report");


// ==================================================
// DIRECTORIES
// ==================================================

const reportsDirectory = path.join(
    __dirname,
    "../reports"
);

if (!fs.existsSync(reportsDirectory)) {
    fs.mkdirSync(
        reportsDirectory,
        {
            recursive: true
        }
    );
}


// ==================================================
// LOAD REPORT DATA
// ==================================================

const getReportData = async (sessionId) => {

    const session =
        await TestSession.findById(
            sessionId
        ).populate("instrument");

    if (!session) {
        throw new Error(
            "Test session not found"
        );
    }

    const results =
        await TestResult.find({
            testSession: sessionId
        }).sort({
            createdAt: 1
        });

    if (!session.instrument) {
        throw new Error(
            "Instrument information not found"
        );
    }

    return {
        session,
        instrument:
            session.instrument,
        results
    };
};


// ==================================================
// GENERATE PDF
// ==================================================

const generatePDF = async (
    reportData,
    filePath
) => {

    return new Promise(
        (resolve, reject) => {

            const {
                session,
                instrument,
                results
            } = reportData;

            const document =
                new PDFDocument({
                    margin: 50,
                    size: "A4"
                });

            const stream =
                fs.createWriteStream(
                    filePath
                );

            document.pipe(stream);

            // --------------------------------------
            // HEADER
            // --------------------------------------

            document
                .fontSize(18)
                .font("Helvetica-Bold")
                .text(
                    "NAWI SMARTLAB",
                    {
                        align: "center"
                    }
                );

            document
                .moveDown(0.4)
                .fontSize(14)
                .text(
                    "NON-AUTOMATIC WEIGHING INSTRUMENT",
                    {
                        align: "center"
                    }
                );

            document
                .moveDown(0.2)
                .fontSize(12)
                .text(
                    "OIML R 76 TEST REPORT",
                    {
                        align: "center"
                    }
                );

            document.moveDown();

            // --------------------------------------
            // REPORT INFORMATION
            // --------------------------------------

            document
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(
                    `Report Number: ${session.reportNumber || "N/A"}`
                );

            document
                .font("Helvetica")
                .text(
                    `Session Number: ${session.sessionNumber}`
                );

            document.text(
                `Standard: ${session.standard.name} : ${session.standard.version}`
            );

            document.text(
                `Test Type: ${session.testType}`
            );

            document.text(
                `Generated: ${new Date().toLocaleString()}`
            );

            document.moveDown();

            // --------------------------------------
            // INSTRUMENT DETAILS
            // --------------------------------------

            document
                .fontSize(13)
                .font("Helvetica-Bold")
                .text(
                    "1. INSTRUMENT DETAILS"
                );

            document.moveDown(0.4);

            document
                .fontSize(10)
                .font("Helvetica");

            document.text(
                `Manufacturer: ${instrument.manufacturer}`
            );

            document.text(
                `Model: ${instrument.model}`
            );

            document.text(
                `Serial Number: ${instrument.serialNumber}`
            );

            document.text(
                `Instrument Type: ${instrument.instrumentType}`
            );

            document.text(
                `Accuracy Class: ${instrument.accuracyClass || "N/A"}`
            );

            document.text(
                `Maximum Capacity: ${instrument.maximumCapacity} ${instrument.unit}`
            );

            document.text(
                `Minimum Capacity: ${instrument.minimumCapacity ?? "N/A"} ${instrument.unit}`
            );

            document.text(
                `Verification Scale Interval (e): ${instrument.verificationScaleInterval ?? "N/A"} ${instrument.unit}`
            );

            document.text(
                `Actual Scale Interval (d): ${instrument.actualScaleInterval ?? "N/A"} ${instrument.unit}`
            );

            document.text(
                `Tare Function: ${instrument.tareFunction ? "Yes" : "No"}`
            );

            document.text(
                `Digital Indication: ${instrument.digitalIndication ? "Yes" : "No"}`
            );

            document.moveDown();

            // --------------------------------------
            // ENVIRONMENT
            // --------------------------------------

            document
                .fontSize(13)
                .font("Helvetica-Bold")
                .text(
                    "2. ENVIRONMENTAL CONDITIONS"
                );

            document
                .fontSize(10)
                .font("Helvetica");

            const environment =
                session.environmentalConditions || {};

            document.text(
                `Temperature: ${environment.temperature ?? "N/A"} ${environment.temperatureUnit || "°C"}`
            );

            document.text(
                `Humidity: ${environment.humidity ?? "N/A"} ${environment.humidityUnit || "%"}`
            );

            document.text(
                `Atmospheric Pressure: ${environment.atmosphericPressure ?? "N/A"} ${environment.pressureUnit || "hPa"}`
            );

            document.moveDown();

            // --------------------------------------
            // TEST RESULTS
            // --------------------------------------

            document
                .fontSize(13)
                .font("Helvetica-Bold")
                .text(
                    "3. TEST RESULTS"
                );

            document.moveDown(0.5);

            if (results.length === 0) {

                document
                    .fontSize(10)
                    .font("Helvetica")
                    .text(
                        "No calculated test results are available."
                    );

            } else {

                results.forEach(
                    (result, index) => {

                        document
                            .fontSize(11)
                            .font("Helvetica-Bold")
                            .text(
                                `${index + 1}. ${result.testName}`
                            );

                        document
                            .fontSize(9)
                            .font("Helvetica");

                        document.text(
                            `Test Code: ${result.testCode}`
                        );

                        document.text(
                            `Calculation ID: ${result.calculationId}`
                        );

                        document.text(
                            `Observed Error: ${
                                result.observedError?.value ?? "N/A"
                            } ${
                                result.observedError?.unit || ""
                            }`
                        );

                        document.text(
                            `Permissible Error: ±${
                                result.permissibleError?.value ?? "N/A"
                            } ${
                                result.permissibleError?.unit || ""
                            }`
                        );

                        document.text(
                            `Compliance: ${result.complianceStatus}`
                        );

                        document.text(
                            `Rule Basis: ${
                                result.ruleBasis?.clause || "N/A"
                            }`
                        );

                        if (result.explanation) {

                            document.text(
                                `Explanation: ${result.explanation}`
                            );

                        }

                        document.moveDown(0.6);
                    }
                );
            }

            // --------------------------------------
            // OVERALL RESULT
            // --------------------------------------

            document
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(
                    "4. OVERALL RESULT"
                );

            document.moveDown(0.4);

            document
                .fontSize(12)
                .text(
                    `Overall Compliance: ${
                        session.overallResult || "REVIEW_REQUIRED"
                    }`
                );

            document.moveDown();

            document
                .fontSize(9)
                .font("Helvetica")
                .text(
                    "This report is generated from observations and calculations recorded in NAWI SmartLab."
                );

            document.text(
                "Applicable regulatory use should be subject to laboratory review and validation."
            );

            // --------------------------------------
            // FOOTER
            // --------------------------------------

            document.moveDown(2);

            document
                .fontSize(9)
                .text(
                    "Generated by NAWI SmartLab",
                    {
                        align: "center"
                    }
                );

            document.end();

            stream.on(
                "finish",
                () => resolve(filePath)
            );

            stream.on(
                "error",
                reject
            );
        }
    );
};


// ==================================================
// GENERATE DOCX
// ==================================================

const generateDOCX = async (
    reportData,
    filePath
) => {

    const {
        session,
        instrument,
        results
    } = reportData;

    const children = [];

    children.push(
        new Paragraph({
            text: "NAWI SMARTLAB",
            heading:
                HeadingLevel.TITLE,
            alignment: "center"
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text:
                        "NON-AUTOMATIC WEIGHING INSTRUMENT"
                })
            ],
            alignment: "center"
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text:
                        "OIML R 76 TEST REPORT",
                    bold: true
                })
            ],
            alignment: "center"
        })
    );

    children.push(
        new Paragraph("")
    );

    // ----------------------------------------------
    // REPORT INFORMATION
    // ----------------------------------------------

    children.push(
        new Paragraph({
            text:
                "Report Information",
            heading:
                HeadingLevel.HEADING_1
        })
    );

    const reportInfo = [
        [
            "Report Number",
            session.reportNumber || "N/A"
        ],
        [
            "Session Number",
            session.sessionNumber
        ],
        [
            "Standard",
            `${session.standard.name} : ${session.standard.version}`
        ],
        [
            "Test Type",
            session.testType
        ]
    ];

    children.push(
        new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },

            rows:
                reportInfo.map(
                    row =>
                        new TableRow({
                            children:
                                row.map(
                                    value =>
                                        new TableCell({
                                            children: [
                                                new Paragraph(
                                                    String(value)
                                                )
                                            ]
                                        })
                                )
                        })
                )
        })
    );

    // ----------------------------------------------
    // INSTRUMENT
    // ----------------------------------------------

    children.push(
        new Paragraph({
            text:
                "Instrument Details",
            heading:
                HeadingLevel.HEADING_1
        })
    );

    const instrumentInfo = [
        ["Manufacturer", instrument.manufacturer],
        ["Model", instrument.model],
        ["Serial Number", instrument.serialNumber],
        ["Instrument Type", instrument.instrumentType],
        ["Accuracy Class", instrument.accuracyClass || "N/A"],
        [
            "Maximum Capacity",
            `${instrument.maximumCapacity} ${instrument.unit}`
        ],
        [
            "Minimum Capacity",
            `${instrument.minimumCapacity ?? "N/A"} ${instrument.unit}`
        ],
        [
            "Verification Scale Interval",
            `${instrument.verificationScaleInterval ?? "N/A"} ${instrument.unit}`
        ],
        [
            "Actual Scale Interval",
            `${instrument.actualScaleInterval ?? "N/A"} ${instrument.unit}`
        ]
    ];

    children.push(
        new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },

            rows:
                instrumentInfo.map(
                    row =>
                        new TableRow({
                            children:
                                row.map(
                                    value =>
                                        new TableCell({
                                            children: [
                                                new Paragraph(
                                                    String(value)
                                                )
                                            ]
                                        })
                                )
                        })
                )
        })
    );

    // ----------------------------------------------
    // TEST RESULTS
    // ----------------------------------------------

    children.push(
        new Paragraph({
            text:
                "Test Results",
            heading:
                HeadingLevel.HEADING_1
        })
    );

    if (results.length === 0) {

        children.push(
            new Paragraph(
                "No calculated test results are available."
            )
        );

    } else {

        const resultRows = [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph("Test")
                        ]
                    }),

                    new TableCell({
                        children: [
                            new Paragraph("Observed Error")
                        ]
                    }),

                    new TableCell({
                        children: [
                            new Paragraph("MPE")
                        ]
                    }),

                    new TableCell({
                        children: [
                            new Paragraph("Result")
                        ]
                    })
                ]
            })
        ];

        results.forEach(
            result => {

                resultRows.push(
                    new TableRow({
                        children: [

                            new TableCell({
                                children: [
                                    new Paragraph(
                                        result.testName
                                    )
                                ]
                            }),

                            new TableCell({
                                children: [
                                    new Paragraph(
                                        `${result.observedError?.value ?? "N/A"} ${
                                            result.observedError?.unit || ""
                                        }`
                                    )
                                ]
                            }),

                            new TableCell({
                                children: [
                                    new Paragraph(
                                        `${result.permissibleError?.value ?? "N/A"} ${
                                            result.permissibleError?.unit || ""
                                        }`
                                    )
                                ]
                            }),

                            new TableCell({
                                children: [
                                    new Paragraph(
                                        result.complianceStatus
                                    )
                                ]
                            })

                        ]
                    })
                );
            }
        );

        children.push(
            new Table({
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE
                },

                rows:
                    resultRows
            })
        );
    }

    // ----------------------------------------------
    // OVERALL RESULT
    // ----------------------------------------------

    children.push(
        new Paragraph({
            text:
                "Overall Result",
            heading:
                HeadingLevel.HEADING_1
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text:
                        `Overall Compliance: ${
                            session.overallResult ||
                            "REVIEW_REQUIRED"
                        }`,
                    bold: true
                })
            ]
        })
    );

    children.push(
        new Paragraph("")
    );

    children.push(
        new Paragraph(
            "Generated by NAWI SmartLab. Regulatory use is subject to laboratory review and validation."
        )
    );

    const document =
        new Document({
            sections: [
                {
                    children
                }
            ]
        });

    const buffer =
        await Packer.toBuffer(
            document
        );

    fs.writeFileSync(
        filePath,
        buffer
    );

    return filePath;
};


// ==================================================
// GENERATE COMPLETE REPORT
// ==================================================

const generateReport = async (
    sessionId
) => {

    const reportData =
        await getReportData(
            sessionId
        );

    const session =
        reportData.session;

    const timestamp =
        Date.now();

    const reportNumber =
        session.reportNumber ||
        `R76-${timestamp}`;

    const pdfFileName =
        `${reportNumber}.pdf`;

    const docxFileName =
        `${reportNumber}.docx`;

    const pdfPath =
        path.join(
            reportsDirectory,
            pdfFileName
        );

    const docxPath =
        path.join(
            reportsDirectory,
            docxFileName
        );

    await generatePDF(
        reportData,
        pdfPath
    );

    await generateDOCX(
        reportData,
        docxPath
    );

    const overallResult =
        session.overallResult === "pass"
            ? "PASS"
            : session.overallResult === "fail"
                ? "FAIL"
                : "REVIEW_REQUIRED";

    const report =
        await Report.findOneAndUpdate(
            {
                testSession:
                    session._id
            },

            {
                testSession:
                    session._id,

                instrument:
                    reportData.instrument._id,

                reportNumber,

                reportVersion: 1,

                standard:
                    session.standard,

                overallResult,

                pdfFile: {
                    fileName:
                        pdfFileName,

                    filePath:
                        `/reports/${pdfFileName}`,

                    generatedAt:
                        new Date()
                },

                docxFile: {
                    fileName:
                        docxFileName,

                    filePath:
                        `/reports/${docxFileName}`,

                    generatedAt:
                        new Date()
                },

                isFinal: false
            },

            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

    return {
        report,
        pdfPath,
        docxPath
    };
};

module.exports = {
    getReportData,
    generateReport
};