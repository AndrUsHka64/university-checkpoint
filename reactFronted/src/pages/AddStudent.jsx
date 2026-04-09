import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client";

const initialForm = {
    card_id: "",
    last_name: "",
    first_name: "",
    patronymic: "",
    phone: "",
    learning_form: "",
};

function AddStudent() {
    const navigate = useNavigate();
    const { instituteId, groupId } = useParams();
    const [form, setForm] = useState(initialForm);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await api.createStudent(groupId, {
                student: form,
                frames: capturedFrames,
            });
            setSuccess("Student was created.");
            setTimeout(() => {
                navigate(`/admin/institutes/${instituteId}/groups/${groupId}/students`);
            }, 600);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const captureFrames = async () => {
        if (!videoRef.current || !isCameraActive) {
            setError("Start camera first.");
            return;
        }

        setIsCapturing(true);
        setError("");
        const frames = [];
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const interval = setInterval(() => {
            const width = videoRef.current.videoWidth || 640;
            const height = videoRef.current.videoHeight || 480;
            canvas.width = width;
            canvas.height = height;
            context.drawImage(videoRef.current, 0, 0, width, height);
            const frame = canvas.toDataURL("image/jpeg", 0.8);
            frames.push(frame);
            setPreviewFrame(frame);
        }, 200);

        await new Promise((resolve) => setTimeout(resolve, 4000));
        clearInterval(interval);
        setCapturedFrames(frames);
        setIsCapturing(false);
    };

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Registration</p>
                <h1>Add student</h1>
            </div>

            <form className="stack-form" onSubmit={handleSubmit}>
                <div className="toolbar">
                    <Link
                        className="button ghost"
                        to={`/admin/institutes/${instituteId}/groups/${groupId}/students`}
                    >
                        Back to students
                    </Link>
                </div>

                <div className="form-grid">
                    <input
                        name="card_id"
                        placeholder="Card number"
                        value={form.card_id}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="last_name"
                        placeholder="Last name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="first_name"
                        placeholder="First name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="patronymic"
                        placeholder="Patronymic"
                        value={form.patronymic}
                        onChange={handleChange}
                    />
                    <input
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                    />
                    <input
                        name="learning_form"
                        placeholder="Learning form"
                        value={form.learning_form}
                        onChange={handleChange}
                    />
                </div>

                <div className="camera-block">
                    <video ref={videoRef} autoPlay muted playsInline />
                    {previewFrame ? (
                        <img src={previewFrame} alt="Captured preview" />
                    ) : (
                        <div className="placeholder">No captured frame yet</div>
                    )}
                </div>

                <div className="toolbar">
                    {!isCameraActive ? (
                        <button type="button" className="button ghost" onClick={startCamera}>
                            Start camera
                        </button>
                    ) : (
                        <button type="button" className="button ghost" onClick={stopCamera}>
                            Stop camera
                        </button>
                    )}
                    <button
                        type="button"
                        className="button primary"
                        onClick={captureFrames}
                        disabled={!isCameraActive || isCapturing}
                    >
                        {isCapturing ? "Capturing..." : "Capture frames"}
                    </button>
                    <button type="submit" className="button primary" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save student"}
                    </button>
                </div>

                <p className="muted-text">Captured: {capturedFrames.length}</p>
                {error ? <p className="error-text">{error}</p> : null}
                {success ? <p className="success-text">{success}</p> : null}
            </form>
        </section>
    );
}

export default AddStudent;
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedFrames, setCapturedFrames] = useState([]);
    const [previewFrame, setPreviewFrame] = useState("");
    const [error, setError] = useState("");

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (_error) {
            setError("Could not open webcam.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);