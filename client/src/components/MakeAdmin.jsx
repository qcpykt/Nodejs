import React, { useState } from 'react';
import axios from 'axios';

const MakeAdmin = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('userToken'); // Получаем токен из localStorage

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/user-management/make-admin/${email}`,
                {},
                {
                    headers: { 'userToken': token } // Добавляем токен в заголовки
                }
            );
            setMessage(response.data.msg); // Успешное сообщение
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.msg || 'Ошибка при обновлении роли пользователя.');
        }
    };

    return (
        <div>
            <h2>Сделать пользователя администратором</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email пользователя:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Сделать администратором</button>
            </form>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
};

export default MakeAdmin;