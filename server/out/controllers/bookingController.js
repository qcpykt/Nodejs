const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
    const { userId, serviceId, dateTime, endDateTime } = req.body;

    try {
        // Проверка существующего бронирования
        const existingBooking = await Booking.findOne({ userId, serviceId, dateTime: new Date(dateTime) });
        if (existingBooking) {
            return res.status(400).json({ message: 'Такое бронирование уже существует.' });
        }

        // Создание нового бронирования
        const newBooking = new Booking({ userId, serviceId, dateTime: new Date(dateTime), endDateTime: new Date(endDateTime) });
        await newBooking.save();

        res.status(201).json({ message: 'Бронирование успешно создано.', booking: newBooking });
    } catch (err) {
        console.error('Ошибка при создании бронирования:', err);
        res.status(500).send('Ошибка при создании бронирования');
    }
};

module.exports = {
    createBooking,
};