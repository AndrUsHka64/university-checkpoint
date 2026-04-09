import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

const initialForm = {
    card_id: "",
    last_name: "",
    first_name: "",
    patronymic: "",
    phone: "",
    learning_form: "",
};

function AddStudent() {
    const { instituteId, groupId } = useParams();
    const [form, setForm] = useState(initialForm);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Registration</p>
                <h1>Add student</h1>
            </div>

            <form className="stack-form">
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
                </div>

                {error ? <p className="error-text">{error}</p> : null}
            </form>
        </section>
    );
}

export default AddStudent;
    const [isCameraActive, setIsCameraActive] = useState(false);
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