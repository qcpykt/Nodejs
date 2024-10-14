import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
          
          //console.log('Server response:', response.data); // Логирование ответа сервера

            // Сохранение токена и статуса администратора в localStorage
            localStorage.setItem('userToken', response.data.token); // Сохраняем токен
            localStorage.setItem('role', response.data.role); // Убедитесь, что здесь правильно передается роль

            // Передача ID пользователя в родительский компонент
            onLogin(response.data.userId, response.data.role, response.data.token); // Вызываем функцию onLogin с userId
            // Автоматический переход на страницу "Сервисы"
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Ошибка входа. Проверьте свои учетные данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Вход в систему</h2>
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Электронная почта"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Пароль"
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Загрузка...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default Login;