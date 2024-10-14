import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditAdminUser = ({ userId, onCancel }) => {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
                    headers: { 'x-auth-token': token }
                });
                setUserData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Ошибка при загрузке пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        setIsSubmitting(true);
        setSuccessMessage(''); // Сбросить сообщение об успехе

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, userData, {
                headers: { 'x-auth-token': token }
            });
            setSuccessMessage('Пользователь успешно обновлен');
            onCancel(); // Закрыть редактирование
        } catch (err) {
            setError(err.response?.data?.msg || 'Ошибка при обновлении пользователя');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Загрузка пользователя...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Редактирование пользователя</h2>
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Имя:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button type="button" onClick={onCancel}>Отменить</button>
            </form>
        </div>
    );
};

export default EditAdminUser;