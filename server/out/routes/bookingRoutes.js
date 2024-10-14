const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');

const router = express.Router();

// Маршрут для создания бронирования
router.post('/', [
    body('userId').notEmpty().withMessage('userId обязателен'),
    body('serviceId').notEmpty().withMessage('serviceId обязателен'),
    body('dateTime').isISO8601().withMessage('dateTime должен быть в формате ISO 8601'),
    body('endDateTime').isISO8601().withMessage('endDateTime должен быть в формате ISO 8601'),
], async (req, res) => {
    // Проверка на наличие ошибок валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, serviceId, dateTime, endDateTime } = req.body;

    try {
        // Создание нового бронирования
        const booking = new Booking({
            userId,
            serviceId,
            dateTime: new Date(dateTime),
            endDateTime: new Date(endDateTime),
        });
        await booking.save();
        res.status(201).json({ message: "Бронирование успешно создано", booking });
    } catch (err) {
        console.error('Ошибка при создании бронирования:', err);
        res.status(500).send('Ошибка на сервере');
    }
});

// Получение всех бронирований
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        console.error('Ошибка при получении бронирований:', err);
        res.status(500).send('Ошибка на сервере');
    }
});

// Получение бронирований по ID услуги
router.get('/service/:serviceId', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const bookings = await Booking.find({ serviceId });
        res.json(bookings);
    } catch (err) {
        console.error('Ошибка при получении бронирований:', err);
        res.status(500).send('Ошибка на сервере');
    }
});

module.exports = router;