import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditReview = ({ reviewId, onCancel }) => {
    const [reviewData, setReviewData] = useState({ rating: '', comment: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchReview = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reviews/${reviewId}`, {
                    headers: { 'x-auth-token': token }
                });
                setReviewData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Ошибка при загрузке отзыва');
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [reviewId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReviewData({ ...reviewData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        setIsSubmitting(true);
        setSuccessMessage(''); // Сбросить сообщение об успехе

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/reviews/${reviewId}`, reviewData, {
                headers: { 'x-auth-token': token }
            });
            setSuccessMessage('Отзыв успешно обновлен');
            onCancel(); // Закрыть редактирование
        } catch (err) {
            setError(err.response?.data?.msg || 'Ошибка при обновлении отзыва');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Загрузка отзыва...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Редактирование отзыва</h2>
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="rating">Рейтинг:</label>
                    <input
                        type="number"
                        id="rating"
                        name="rating"
                        value={reviewData.rating}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="comment">Комментарий:</label>
                    <textarea
                        id="comment"
                        name="comment"
                        value={reviewData.comment}
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

export default EditReview;