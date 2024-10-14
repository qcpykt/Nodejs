const express = require('express');
const User = require('../models/User');
const auth = require('./auth'); // Импортируйте middleware для аутентификации
const router = express.Router();

// Маршрут для обновления роли пользователя на администратора
router.patch('/make-admin/:email', auth, async (req, res) => {
    // Проверка, является ли текущий пользователь администратором
    if (!req.user.role === 'admin') {
        return res.status(403).send('Доступ запрещен');
    }

    try {
        // Поиск пользователя и обновление его роли
        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            { role: 'admin' }, // Обновляем роль на 'admin'
            { new: true } // Возвращаем обновленный объект пользователя
        );

        // Если пользователь не найден
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }

        // Успешный ответ с обновленной информацией о пользователе
        res.json({ msg: 'Пользователь стал администратором', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;