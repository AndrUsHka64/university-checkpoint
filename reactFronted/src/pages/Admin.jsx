import { Link } from "react-router-dom";

const shortcuts = [
    {
        to: "/admin/institutes",
        title: "Institutes and Groups",
        text: "Manage university structure.",
    },
    {
        to: "/start",
        title: "Monitor",
        text: "Open real-time camera monitor.",
    },
];

function Admin() {
    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Management</p>
                <h1>Admin panel</h1>
            </div>
            <div className="card-grid">
                {shortcuts.map((item) => (
                    <Link key={item.to} to={item.to} className="card-link">
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Admin;