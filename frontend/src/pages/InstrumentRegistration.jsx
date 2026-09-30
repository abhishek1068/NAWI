import React, {
    useState
} from "react";

import {
    registerInstrument
} from "../services/api";

function InstrumentRegistration({
    onComplete
}) {

    const [form, setForm] = useState({

        manufacturer: "",
        model: "",
        serialNumber: "",

        instrumentType:
            "electronic_weighing_instrument",

        accuracyClass: "III",

        maximumCapacity: "",
        minimumCapacity: "",

        verificationScaleInterval: "",
        actualScaleInterval: "",

        unit: "kg",

        numberOfVerificationIntervals:
            "",

        numberOfRanges: 1,

        tareFunction: false,

        selfIndicating: true,

        digitalIndication: true,

        multipleIndicatingDevices:
            false,

        mobileInstrument: false

    });

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setForm({
            ...form,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });
    };

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const payload = {

                ...form,

                maximumCapacity:
                    Number(
                        form.maximumCapacity
                    ),

                minimumCapacity:
                    Number(
                        form.minimumCapacity
                    ),

                verificationScaleInterval:
                    Number(
                        form.verificationScaleInterval
                    ),

                actualScaleInterval:
                    Number(
                        form.actualScaleInterval
                    ),

                numberOfVerificationIntervals:
                    form.numberOfVerificationIntervals
                        ? Number(
                            form.numberOfVerificationIntervals
                        )
                        : undefined,

                numberOfRanges:
                    Number(
                        form.numberOfRanges
                    )
            };

            const response =
                await registerInstrument(
                    payload
                );

            onComplete(
                response.data.instrument
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to register instrument"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <div className="eyebrow">
                        STEP 01 / INSTRUMENT PROFILE
                    </div>

                    <h1>
                        Register Instrument
                    </h1>

                    <p>
                        Enter the technical
                        configuration of the NAWI.
                        SmartLab will automatically
                        determine the applicable
                        OIML R76 tests.
                    </p>

                </div>

                <div className="standard-chip">
                    OIML R76:2006
                </div>

            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <form
                className="form-layout"
                onSubmit={handleSubmit}
            >

                <div className="form-panel">

                    <div className="form-panel-title">
                        Instrument Identification
                    </div>

                    <div className="form-grid">

                        <div className="form-field">

                            <label>
                                Manufacturer *
                            </label>

                            <input
                                name="manufacturer"
                                value={
                                    form.manufacturer
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="ABC Weighing Systems"
                                required
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Model *
                            </label>

                            <input
                                name="model"
                                value={
                                    form.model
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="AWS-300"
                                required
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Serial Number *
                            </label>

                            <input
                                name="serialNumber"
                                value={
                                    form.serialNumber
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="AWS300-001"
                                required
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Instrument Type *
                            </label>

                            <select
                                name="instrumentType"
                                value={
                                    form.instrumentType
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="electronic_weighing_instrument">
                                    Electronic Weighing Instrument
                                </option>

                                <option value="platform_scale">
                                    Platform Scale
                                </option>

                                <option value="weighbridge">
                                    Weighbridge
                                </option>

                                <option value="other">
                                    Other
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                <div className="form-panel">

                    <div className="form-panel-title">
                        Metrological Parameters
                    </div>

                    <div className="form-grid">

                        <div className="form-field">

                            <label>
                                Accuracy Class *
                            </label>

                            <select
                                name="accuracyClass"
                                value={
                                    form.accuracyClass
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="I">
                                    Class I
                                </option>

                                <option value="II">
                                    Class II
                                </option>

                                <option value="III">
                                    Class III
                                </option>

                                <option value="IIII">
                                    Class IIII
                                </option>

                            </select>

                        </div>

                        <div className="form-field">

                            <label>
                                Unit
                            </label>

                            <select
                                name="unit"
                                value={
                                    form.unit
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="kg">
                                    kg
                                </option>

                                <option value="g">
                                    g
                                </option>

                                <option value="t">
                                    t
                                </option>

                            </select>

                        </div>

                        <div className="form-field">

                            <label>
                                Maximum Capacity *
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="maximumCapacity"
                                value={
                                    form.maximumCapacity
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="300"
                                required
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Minimum Capacity
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="minimumCapacity"
                                value={
                                    form.minimumCapacity
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.2"
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Verification Scale Interval (e) *
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="verificationScaleInterval"
                                value={
                                    form.verificationScaleInterval
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.1"
                                required
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Actual Scale Interval (d)
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="actualScaleInterval"
                                value={
                                    form.actualScaleInterval
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.1"
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Verification Intervals
                            </label>

                            <input
                                type="number"
                                name="numberOfVerificationIntervals"
                                value={
                                    form.numberOfVerificationIntervals
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="3000"
                            />

                        </div>

                        <div className="form-field">

                            <label>
                                Number of Ranges
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="numberOfRanges"
                                value={
                                    form.numberOfRanges
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                    </div>

                </div>

                <div className="form-panel">

                    <div className="form-panel-title">
                        Instrument Configuration
                    </div>

                    <div className="checkbox-grid">

                        <label className="checkbox-card">

                            <input
                                type="checkbox"
                                name="tareFunction"
                                checked={
                                    form.tareFunction
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <div>
                                <strong>
                                    Tare Function
                                </strong>

                                <span>
                                    Instrument has tare capability
                                </span>
                            </div>

                        </label>

                        <label className="checkbox-card">

                            <input
                                type="checkbox"
                                name="digitalIndication"
                                checked={
                                    form.digitalIndication
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <div>
                                <strong>
                                    Digital Indication
                                </strong>

                                <span>
                                    Digital weighing indication
                                </span>
                            </div>

                        </label>

                        <label className="checkbox-card">

                            <input
                                type="checkbox"
                                name="selfIndicating"
                                checked={
                                    form.selfIndicating
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <div>
                                <strong>
                                    Self-Indicating
                                </strong>

                                <span>
                                    Direct weighing indication
                                </span>
                            </div>

                        </label>

                        <label className="checkbox-card">

                            <input
                                type="checkbox"
                                name="multipleIndicatingDevices"
                                checked={
                                    form.multipleIndicatingDevices
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <div>
                                <strong>
                                    Multiple Indicators
                                </strong>

                                <span>
                                    More than one indicating device
                                </span>
                            </div>

                        </label>

                        <label className="checkbox-card">

                            <input
                                type="checkbox"
                                name="mobileInstrument"
                                checked={
                                    form.mobileInstrument
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <div>
                                <strong>
                                    Mobile Instrument
                                </strong>

                                <span>
                                    Instrument designed for mobility
                                </span>
                            </div>

                        </label>

                    </div>

                </div>

                <div className="form-actions">

                    <div className="form-note">

                        <strong>
                            SmartLab Intelligence
                        </strong>

                        <span>
                            The instrument configuration
                            will automatically generate
                            the applicable R76 test plan.
                        </span>

                    </div>

                    <button
                        type="submit"
                        className="primary-button large"
                        disabled={loading}
                    >
                        {loading
                            ? "Registering..."
                            : "Register & Generate Test Plan →"
                        }
                    </button>

                </div>

            </form>

        </div>
    );
}

export default InstrumentRegistration;