import { NavLink } from "react-router-dom";

const links = [
    { to: "/", label: "Home", end: true },
    { to: "/start", label: "Monitor" },
    { to: "/admin", label: "Admin" },
    { to: "/admin/institutes", label: "Structure" },
    { to: "/admin/notifications", label: "Notifications" },
];

function Header() {
    return (
        <header className="topbar">
            <strong>University Checkpoint</strong>
            <nav className="nav-links">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}

export default Header;