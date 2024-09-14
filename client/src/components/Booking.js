import React, { useState } from "react";
import axios from "axios";

const Booking = ({ serviceId }) => {
    const [dateTime, setDateTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Сброс ошибки перед новой попыткой

        // Проверка на будущее время
        const selectedDateTime = new Date(dateTime);
        const now = new Date();
        if (selectedDateTime <= now) {
            setError("Выберите дату и время в будущем.");
            setLoading(false);
            return;
        }

        try {
            const userId = "12345"; // Замените на идентификатор текущего пользователя
            await axios.post(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/bookings",
                { userId, serviceId, dateTime },
            );
            alert("Бронирование успешно создано");
            setDateTime(""); // Очистка поля после успешного бронирования
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Ошибка бронирования");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={onSubmit}>
                <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Загрузка..." : "Забронировать"}
                </button>
                {error && <div className="alert alert-danger">{error}</div>}
            </form>
        </div>
    );
};

export default Booking;
