import axios from "axios";


const API = axios.create({

    baseURL:
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5100"}/api`,

    headers: {
        "Content-Type":
            "application/json"
    }

});


// ---------------------------------------------
// HEALTH
// ---------------------------------------------

export const healthCheck = () =>
    API.get(
        "/health"
    );


// ---------------------------------------------
// INSTRUMENTS
// ---------------------------------------------

export const getInstruments = () =>
    API.get(
        "/instruments"
    );


export const getInstrument = (
    id
) =>
    API.get(
        `/instruments/${id}`
    );


export const getLatestCompletedSession = (
    instrumentId
) =>
    API.get(
        `/instruments/${instrumentId}/latest-session`
    );
    
export const deleteInstrument = (
    instrumentId
) =>
    API.delete(
        `/instruments/${instrumentId}`
    );

export const registerInstrument = (
    data
) =>
    API.post(
        "/instruments",
        data
    );


export const startTestSession = (
    instrumentId
) =>
    API.post(
        `/instruments/${instrumentId}/start-test`
    );


// ---------------------------------------------
// TEST SESSION
// ---------------------------------------------

export const getTestSession = (
    sessionId
) =>
    API.get(
        `/tests/sessions/${sessionId}`
    );


export const getTestPlan = (
    sessionId
) =>
    API.get(
        `/tests/sessions/${sessionId}/test-plan`
    );


// ---------------------------------------------
// OBSERVATIONS
// ---------------------------------------------

export const saveObservation = (
    sessionId,
    data
) =>
    API.post(
        `/tests/sessions/${sessionId}/observations`,
        data
    );


// ---------------------------------------------
// CALCULATIONS
// ---------------------------------------------

export const calculateIndication = (
    sessionId,
    data
) =>
    API.post(
        `/tests/sessions/${sessionId}/calculate/indication`,
        data
    );


export const calculateRepeatability = (
    sessionId,
    data
) =>
    API.post(
        `/tests/sessions/${sessionId}/calculate/repeatability`,
        data
    );


// ---------------------------------------------
// TEST RESULT WORKFLOW
// ---------------------------------------------

export const recordTestResult = (
    data
) =>
    API.post(
        "/test-results/record",
        data
    );


export const getSessionCompliance = (
    sessionId
) =>
    API.get(
        `/test-results/session/${sessionId}/compliance`
    );


export const finalizeTestSession = (
    sessionId
) =>
    API.post(
        `/test-results/session/${sessionId}/finalize`
    );


// ---------------------------------------------
// LEGACY COMPLIANCE
// ---------------------------------------------

export const getCompliance = (
    sessionId
) =>
    API.get(
        `/tests/sessions/${sessionId}/compliance`
    );


export const recalculateCompliance = (
    sessionId
) =>
    API.post(
        `/tests/sessions/${sessionId}/recalculate`
    );


// ---------------------------------------------
// REPORTS
// ---------------------------------------------

export const generateReport = (
    sessionId
) =>
    API.post(
        `/reports/session/${sessionId}/generate`
    );


export const getSessionReports = (
    sessionId
) =>
    API.get(
        `/reports/session/${sessionId}`
    );


export default API;