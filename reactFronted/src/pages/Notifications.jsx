import { useContext, useState } from "react";

import { NotificationContext } from "../App";

const initialForm = {
    card_id: "",
    name: "",
    text: "",
};

function Notifications() {
    const { notificationList, setNotificationList } = useContext(NotificationContext);
    const [form, setForm] = useState(initialForm);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.card_id.trim() || !form.text.trim()) {
            return;
        }

        setNotificationList((prev) => [
            ...prev,
            {
                id: Date.now(),
                card_id: form.card_id.trim(),
                name: form.name.trim() || "No name",
                text: form.text.trim(),
            },
        ]);
        setForm(initialForm);
    };

    const handleDelete = (id) => {
        setNotificationList((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Notifications</p>
                <h1>Notifications by card id</h1>
            </div>

            <form className="stack-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <input
                        name="card_id"
                        placeholder="Card id"
                        value={form.card_id}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="name"
                        placeholder="Name (optional)"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <input
                        name="text"
                        placeholder="Notification text"
                        value={form.text}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="button primary">
                    Add notification
                </button>
            </form>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Card</th>
                            <th>Text</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {notificationList.map((notification) => (
                            <tr key={notification.id}>
                                <td>{notification.name}</td>
                                <td>{notification.card_id}</td>
                                <td>{notification.text}</td>
                                <td>
                                    <button
                                        className="button danger"
                                        type="button"
                                        onClick={() => handleDelete(notification.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default Notifications;