import React, { useState } from "react";
import axios from "axios";

const Booking = ({ serviceId }) => {
    const [dateTime, setDateTime] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = "12345"; // Замените на идентификатор текущего пользователя
            await axios.post(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev/api/bookings",
                { userId, serviceId, dateTime },
            );
            alert("Бронирование успешно создано");
        } catch (err) {
            console.error(err);
            alert("Ошибка бронирования");
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
            />
            <button type="submit">Забронировать</button>
        </form>
    );
};

export default Booking;
