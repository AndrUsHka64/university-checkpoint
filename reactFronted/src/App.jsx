import { Outlet } from "react-router-dom";

import Header from "./components/Header";

function App() {
    return (
        <div className="app-shell">
            <Header />
            <main className="page-shell">
                <Outlet />
            </main>
        </div>
    );
}

export default App;