import React, { useEffect, useState } from "react";
import axios from "axios";

const Reviews = ({ serviceId }) => {
    const [reviews, setReviews] = useState([]);
    const [formData, setFormData] = useState({
        rating: "",
        comment: "",
    });

    const { rating, comment } = formData;

    useEffect(() => {
        const fetchReviews = async () => {
            const response = await axios.get(
                `https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/reviews/${serviceId}`,
            );
            setReviews(response.data);
        };
        fetchReviews();
    }, [serviceId]);

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = "12345"; // Замените на идентификатор текущего пользователя
            await axios.post(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/reviews",
                {
                    userId,
                    serviceId,
                    rating,
                    comment,
                },
            );
            alert("Отзыв успешно добавлен");
            setFormData({ rating: "", comment: "" }); // Сброс формы
            // Обновите список отзывов
            const response = await axios.get(
                `https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/reviews/${serviceId}`,
            );
            setReviews(response.data);
        } catch (err) {
            console.error(err);
            alert("Ошибка добавления отзыва");
        }
    };

    return (
        <div>
            <h3>Отзывы</h3>
            <form onSubmit={onSubmit}>
                <input
                    type="number"
                    name="rating"
                    value={rating}
                    onChange={onChange}
                    placeholder="Рейтинг (1-5)"
                    min="1"
                    max="5"
                    required
                />
                <textarea
                    name="comment"
                    value={comment}
                    onChange={onChange}
                    placeholder="Ваш отзыв"
                    required
                />
                <button type="submit">Добавить отзыв</button>
            </form>
            <ul>
                {reviews.map((review) => (
                    <li key={review._id}>
                        <strong>Рейтинг: {review.rating}</strong>
                        <p>{review.comment}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Reviews;
