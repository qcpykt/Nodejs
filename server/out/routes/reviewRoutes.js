const express = require('express');
const Review = require('../models/Review')
const { getReviews, addReview } = require('../controllers/reviewController');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Получение отзывов по ID пользователя
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const reviews = await Review.find({ userId });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Ошибка при получении отзывов." });
    }
});

// Получение отзывов по ID услуги
router.get("/service/:serviceId", async (req, res) => {
    const { serviceId } = req.params;
    try {
        const reviews = await Review.find({ serviceId });
        if (!reviews.length) {
            return res.status(404).json({ msg: "Нет отзывов для данной услуги." });
        }
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Ошибка сервера." });
    }
});

// Добавление нового отзыва
router.post("/", [
    body('userId').notEmpty().withMessage('userId обязателен'),
    body('serviceId').notEmpty().withMessage('serviceId обязателен'),
    body('rating').isNumeric().withMessage('Рейтинг должен быть числом')
        .isInt({ min: 0, max: 5 }).withMessage('Рейтинг должен быть от 0 до 5'),
    body('comment').notEmpty().withMessage('Комментарий обязателен')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, serviceId, rating, comment } = req.body;

    try {
        const newReview = new Review({ userId, serviceId, rating, comment });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Ошибка сервера при добавлении отзыва." });
    }
});

// Обновление существующего отзыва
router.put("/:reviewId", async (req, res) => {
    try {
        const updatedReview = await Review.findByIdAndUpdate(req.params.reviewId, req.body, { new: true });
        if (!updatedReview) return res.status(404).json({ msg: "Отзыв не найден." });
        res.json(updatedReview);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Ошибка сервера при обновлении отзыва." });
    }
});

module.exports = router;