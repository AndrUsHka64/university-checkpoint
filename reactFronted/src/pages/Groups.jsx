import { Link, useParams } from "react-router-dom";

const demoGroups = [];

function Groups() {
    const { instituteId } = useParams();

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

            <div className="list-grid">
                {demoGroups.map((group) => (
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