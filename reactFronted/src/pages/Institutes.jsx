import { Link } from "react-router-dom";

const demoInstitutes = [];

function Institutes() {
    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Structure</p>
                <h1>Institutes</h1>
            </div>

            <div className="list-grid">
                {demoInstitutes.map((institute) => (
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