import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfileReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserReviews = async () => {
            const token = localStorage.getItem('userToken'); // Получаем токен из localStorage
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setError("Необходимо войти в систему для просмотра отзывов.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/users/${userId}/reviews`, {
                    headers: { 'userToken': token, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'  } // Добавляем токен в заголовок
                });
                setReviews(response.data);
            } catch (err) {
                setError("Ошибка при загрузке ваших отзывов. Пожалуйста, попробуйте позже.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserReviews();
    }, []);

    const renderOverallStars = (rating) => {
        const clampedRating = Math.max(0, Math.min(rating, 5));

        const fullStars = Math.floor(clampedRating);
        const halfStar = (clampedRating % 1) >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <div className="star-rating">
                {Array.from({ length: fullStars }, (v, i) => (
                    <span key={`full-${i}`} className="star full" style={{ color: 'gold' }}>★</span>
                ))}
                {halfStar === 1 && <span className="star half" style={{ color: 'gold' }}>★</span>}
                {Array.from({ length: emptyStars }, (v, i) => (
                    <span key={`empty-${i}`} className="star">★</span>
                ))}
            </div>
        );
    };

    if (loading) return <p>Загрузка ваших отзывов...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h3>Ваши отзывы</h3>
            {reviews.length === 0 ? (
                <p>У вас нет отзывов.</p>
            ) : (
                reviews.map((review) => (
                    <div key={review._id} className="review">
                        <h4>Рейтинг: {renderOverallStars(review.rating)}</h4>
                        <p>{review.comment}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserProfileReviews;