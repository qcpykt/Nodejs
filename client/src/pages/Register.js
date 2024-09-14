import React, { useState } from "react";
import axios from "axios";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { name, phone, email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Сброс ошибки перед новой попыткой

        try {
            await axios.post(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev:5000/api/users/register",
                formData,
            );
            alert("Пользователь зарегистрирован");
            // Очистка формы
            setFormData({
                name: "",
                phone: "",
                email: "",
                password: "",
            });
        } catch (err) {
            console.error(err);
            // Установка сообщения об ошибке
            setError(err.response?.data?.message || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Регистрация</h2>
            <form onSubmit={onSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={name}
                        onChange={onChange}
                        placeholder="Имя"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={phone}
                        onChange={onChange}
                        placeholder="Телефон"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
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
                        className="form-control"
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
                    {loading ? "Загрузка..." : "Зарегистрироваться"}
                </button>
            </form>
        </div>
    );
};

export default Register;
