import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Booking = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');

    const generateAvailableTimeSlots = (selectedDate, start, end) => {
        if (!selectedDate) return [];

        const slots = [];
        const startHour = parseInt(start.split(':')[0], 10);
        const endHour = parseInt(end.split(':')[0], 10);

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                slots.push(timeSlot);
            }
        }
        return slots;
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        const availableSlots = generateAvailableTimeSlots(newDate, '09:00', '17:00');
        setAvailableTimeSlots(availableSlots);
    };

    const handleStartTimeChange = (time) => {
        setStartTime(time);
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
    };

    const bookSlot = async () => {
        if (!startTime || !endTime) {
            setError("Пожалуйста, выберите время начала и конца.");
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, {
                userId: 'ваш_userId',
                serviceId: 'ваш_serviceId',
                dateTime: new Date(`${selectedDate.toLocaleDateString()} ${startTime}`).toISOString(),
                endDateTime: new Date(`${selectedDate.toLocaleDateString()} ${endTime}`).toISOString(),
            });
            //console.log("Бронирование успешно:", response.data);
        } catch (error) {
            console.error("Ошибка при бронировании:", error.response ? error.response.data : error.message);
            setError(error.response?.data?.message || "Ошибка бронирования");
        }
    };

    return (
        <div>
            <h1>Бронирование</h1>
            {error && <div className="error">{error}</div>}
            <input type="date" onChange={(e) => handleDateChange(new Date(e.target.value))} />
            <div>
                <h2>Выберите время начала:</h2>
                {availableTimeSlots.map((slot) => (
                    <button key={slot} onClick={() => handleStartTimeChange(slot)}>{slot}</button>
                ))}
            </div>
            <div>
                <h2>Выберите время конца:</h2>
                {availableTimeSlots.map((slot) => (
                    <button key={slot} onClick={() => handleEndTimeChange(slot)}>{slot}</button>
                ))}
            </div>
            <button onClick={bookSlot}>Забронировать</button>
        </div>
    );
};

export default Booking;