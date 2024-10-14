import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditService = ({ serviceId, onCancel }) => {
    const [serviceData, setServiceData] = useState({ title: '', description: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchService = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/services/${serviceId}`, {
                    headers: { 'x-auth-token': token }
                });
                setServiceData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Ошибка при загрузке услуги');
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [serviceId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setServiceData({ ...serviceData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        setIsSubmitting(true);
        setSuccessMessage(''); // Сбросить сообщение об успехе

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/services/${serviceId}`, serviceData, {
                headers: { 'x-auth-token': token }
            });
            setSuccessMessage('Услуга успешно обновлена');
            onCancel(); // Закрыть редактирование
        } catch (err) {
            setError(err.response?.data?.msg || 'Ошибка при обновлении услуги');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Загрузка услуги...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Редактирование услуги</h2>
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Название:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={serviceData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={serviceData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="price">Цена:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={serviceData.price}
                        onChange={handleChange}
                        min="0"
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

export default EditService;