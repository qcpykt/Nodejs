import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Сброс ошибки перед новой попыткой

        try {
            const response = await axios.post(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/users/login",
                formData,
            );
            alert(response.data.msg); // Успешное сообщение
            // Здесь можно добавить логику для сохранения токена или перенаправления пользователя
        } catch (err) {
            console.error(err);
            // Установка сообщения об ошибке
            setError(err.response?.data?.msg || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Вход</h2>
            <form onSubmit={onSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Электронная почта"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Пароль"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Загрузка..." : "Войти"}
                </button>
            </form>
        </div>
    );
};

export default Login;
