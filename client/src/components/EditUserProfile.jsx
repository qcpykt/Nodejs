
//src/components/EditUserProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditUserProfile = ({ userId, onCancel }) => {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
                setUserData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Ошибка при загрузке данных пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, userData);
            alert('Данные успешно обновлены');
            onCancel(); // Закрыть редактирование
        } catch (err) {
            setError(err.response?.data?.msg || 'Ошибка при обновлении данных');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Имя:</label>
                <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Сохранить</button>
            <button type="button" onClick={onCancel}>Отмена</button>
        </form>
    );
};

export default EditUserProfile;