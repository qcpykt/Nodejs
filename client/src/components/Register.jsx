import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Register = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        userId: uuidv4(),
        name: "",
        phone: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate(); // Хук для навигации

    const { name, phone, email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        //console.log("Отправляемые данные:", formData); // Отладка данных

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
            //console.log("Response from registration:", response.data); // Логирование ответа

            // Проверка на наличие userId и userToken
            const { userId, userToken } = response.data;
            if (!userId || !userToken) {
                throw new Error("Не удалось получить userId или userToken.");
            }
          
          // Удаляем старые токены, если они существуют
        localStorage.removeItem('token'); // Удаляем лишний токен, если он есть

            // Сохранение в localStorage
            localStorage.setItem('userId', userId);
            localStorage.setItem('userToken', userToken);

            // Вход пользователя
            onLogin(userId, userToken); // Передаем userId и userToken

            // Переход на страницу "Сервисы"
            navigate('/');

            // Очистка формы
            setFormData({
                userId: uuidv4(), // Генерация уникального userId
                name: "",
                phone: "",
                email: "",
                password: "",
            });
            setSuccessMessage("Пользователь успешно зарегистрирован!");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

  

    return (
        <div className="container mt-5">
            <h2>Регистрация</h2>
            <form onSubmit={onSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Успешное сообщение */}
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
