import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import "./index.css";
import Admin from "./pages/Admin";
import AddStudent from "./pages/AddStudent";
import Groups from "./pages/Groups";
import Hello from "./pages/Hello";
import Institutes from "./pages/Institutes";
import MainPage from "./pages/MainPage";
import Notifications from "./pages/Notifications";
import Students from "./pages/Students";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Hello /> },
            { path: "start", element: <MainPage /> },
            { path: "admin", element: <Admin /> },
            { path: "admin/institutes", element: <Institutes /> },
            { path: "admin/notifications", element: <Notifications /> },
            {
                path: "admin/institutes/:instituteId/groups",
                element: <Groups />,
            },
            {
                path: "admin/institutes/:instituteId/groups/:groupId/students",
                element: <Students />,
            },
            {
                path: "admin/institutes/:instituteId/groups/:groupId/students/new",
                element: <AddStudent />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);