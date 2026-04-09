import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";

function Institutes() {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadInstitutes = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await api.getInstitutes();
                setInstitutes(data);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        };

        loadInstitutes();
    }, []);

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Structure</p>
                <h1>Institutes</h1>
            </div>

            {error ? <p className="error-text">{error}</p> : null}
            {loading ? <p className="muted-text">Loading...</p> : null}

            <div className="list-grid">
                {institutes.map((institute) => (
                    <Link
                        key={institute.id}
                        className="list-item"
                        to={`/admin/institutes/${institute.id}/groups`}
                    >
                        <span>{institute.name}</span>
                        <small>Open groups</small>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Institutes;