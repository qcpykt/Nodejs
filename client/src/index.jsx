import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.jsx';
import "./index.css"; // Стили для приложения
import "./styles.css"; // Подключаем стили для приложения
import "bootstrap/dist/css/bootstrap.min.css"; // Подключаем Bootstrap
import "@fortawesome/fontawesome-free/css/all.min.css"; // Подключаем Font Awesome

const root = ReactDOM.createRoot(document.getElementById("root")); // Create the root
root.render(
    // Render the App component
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
