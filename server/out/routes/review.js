const express = require('express');
const Review = require('../models/Review');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Добавление нового отзыва
router.post(
    '/',
    [
        body('userId').notEmpty().withMessage('userId обязателен'),
        body('serviceId').notEmpty().withMessage('serviceId обязателен'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
        body('comment').notEmpty().withMessage('Комментарий обязателен')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, serviceId, rating, comment } = req.body;

        try {
            const review = new Review({ userId, serviceId, rating, comment });
            await review.save();
            res.status(201).json(review);
        } catch (err) {
            console.error(err);
            res.status(500).send('Ошибка при добавлении отзыва');
        }
    }
);

// Получение всех отзывов для услуги
router.get('/:serviceId', async (req, res) => {
    try {
        const reviews = await Review.find({ serviceId: req.params.serviceId });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении отзывов');
    }
});

module.exports = router;