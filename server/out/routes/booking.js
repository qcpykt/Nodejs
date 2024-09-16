const express = require('express');
const Booking = require('../models/Booking');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Создание нового бронирования
router.post(
    '/',
    [
        body('userId').notEmpty().withMessage('userId обязателен'),
        body('serviceId').notEmpty().withMessage('serviceId обязателен'),
        body('dateTime').isISO8601().withMessage('dateTime должен быть в формате ISO 8601')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, serviceId, dateTime } = req.body;

        try {
            const booking = new Booking({ userId, serviceId, dateTime });
            await booking.save();
            res.status(201).json(booking);
        } catch (err) {
            console.error(err);
            res.status(500).send('Ошибка при создании бронирования');
        }
    }
);

// Получение всех бронирований пользователя
router.get('/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении бронирований');
    }
});

module.exports = router;