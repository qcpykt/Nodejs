// routes/user.js
const express = require('express');
const User = require('../models/User'); // Импортируем модель User
const Review = require('../models/Review'); // Импортируем модель Review
const auth = require('../middleware/authMiddleware'); // Импортируйте middleware для аутентификации
const router = express.Router();

// Получение данных пользователя по userId
router.get('/:userId', auth, async (req, res) => {
    try {
        // Проверяем, что запрашиваемый пользователь существует
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).send("Пользователь не найден.");

        // Отправляем данные пользователя, исключая пароль и другие чувствительные данные
        const { password, ...userData } = user.toObject();
        res.send(userData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении пользователя');
    }
});

router.put('/:id', auth, async (req, res) => {
    const userId = req.params.id;
    const updatedUserData = req.body;

    try {
        // Находим пользователя по ID и обновляем его данные
        const user = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }

        // Возвращаем обновленного пользователя
        return res.json(user); // Отправляем только обновленного пользователя
    } catch (err) {
        console.error(err);
        return res.status(500).send('Ошибка при обновлении пользователя');
    }
});

// Получение отзывов пользователя
router.get('/:userId/reviews', auth, async (req, res) => {
    try {
        // Проверяем, что запрашиваемый пользователь существует
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).send("Пользователь не найден.");

        // Получаем отзывы пользователя
        const reviews = await Review.find({ userId: req.params.userId });
        res.send(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении отзывов');
    }
});

module.exports = router;