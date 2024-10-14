// src/components/Auth.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

const Auth = ({ onLogin }) => {
    const location = useLocation();

    // Определяем, находимся ли мы на странице входа или регистрации
    const isLoginPage = location.pathname === '/login';

    return (
        <div>
            {isLoginPage ? (
                <Login onLogin={onLogin} /> // Отображаем компонент входа
            ) : (
                <Register onLogin={onLogin} /> // Отображаем компонент регистрации
            )}
        </div>
    );
};

export default Auth;