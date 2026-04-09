import { createContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./components/Header";

export const NotificationContext = createContext(null);

const STORAGE_KEY = "university.notifications";

function App() {
    const [notificationList, setNotificationList] = useState(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (_error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationList));
    }, [notificationList]);

    return (
        <NotificationContext.Provider value={{ notificationList, setNotificationList }}>
            <div className="app-shell">
                <Header />
                <main className="page-shell">
                    <Outlet />
                </main>
            </div>
        </NotificationContext.Provider>
    );
}

export default App;