import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";

function Groups() {
    const { instituteId } = useParams();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadGroups = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await api.getGroups(instituteId);
                setGroups(data);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        };

        loadGroups();
    }, [instituteId]);

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Structure</p>
                <h1>Groups of institute #{instituteId}</h1>
            </div>

            <div className="toolbar">
                <Link className="button ghost" to="/admin/institutes">
                    Back to institutes
                </Link>
            </div>

            {error ? <p className="error-text">{error}</p> : null}
            {loading ? <p className="muted-text">Loading...</p> : null}

            <div className="list-grid">
                {groups.map((group) => (
                    <Link
                        key={group.id}
                        className="list-item"
                        to={`/admin/institutes/${instituteId}/groups/${group.id}/students`}
                    >
                        <span>{group.name}</span>
                        <small>Open students</small>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Groups;