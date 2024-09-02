import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/users/login",
                formData,
            );
            alert(response.data.msg); // Успешное сообщение
        } catch (err) {
            console.error(err);
            alert("Ошибка входа");
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Электронная почта"
                required
            />
            <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Пароль"
                required
            />
            <button type="submit">Войти</button>
        </form>
    );
};

export default Login;
