const Report = require("../models/Report");

const {
    generateReport
} = require("../services/reportService");


// ==================================================
// GENERATE REPORT
// ==================================================

const createReport = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await generateReport(
                req.params.sessionId
            );

        res.status(201).json({

            success: true,

            message:
                "PDF and DOCX test reports generated successfully",

            report:
                result.report,

            files: {

                pdf: {
                    fileName:
                        result.report.pdfFile.fileName,

                    path:
                        result.report.pdfFile.filePath
                },

                docx: {
                    fileName:
                        result.report.docxFile.fileName,

                    path:
                        result.report.docxFile.filePath
                }

            }

        });

    } catch (error) {
        next(error);
    }
};


// ==================================================
// GET REPORT
// ==================================================

const getReport = async (
    req,
    res,
    next
) => {

    try {

        const report =
            await Report.findById(
                req.params.id
            )
            .populate("instrument")
            .populate("testSession");

        if (!report) {

            return res.status(404).json({
                success: false,
                message: "Report not found"
            });

        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        next(error);
    }
};


// ==================================================
// GET REPORTS FOR SESSION
// ==================================================

const getSessionReports = async (
    req,
    res,
    next
) => {

    try {

        const reports =
            await Report.find({
                testSession:
                    req.params.sessionId
            })
            .sort({
                createdAt: -1
            });

        res.json({

            success: true,

            count:
                reports.length,

            reports

        });

    } catch (error) {
        next(error);
    }
};


module.exports = {

    createReport,

    getReport,

    getSessionReports

};